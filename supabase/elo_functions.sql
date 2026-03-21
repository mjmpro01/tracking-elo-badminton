-- SQL helpers & RPCs cho Elo hệ thống badminton-tracking-elo
-- Có thể copy toàn bộ file này vào Supabase SQL editor để tạo function.

-- Helper: lấy rating hiện tại của 1 player (hoặc 1000 nếu là member chưa có history)
create or replace function public.get_current_rating(p_player_id uuid)
returns numeric
language plpgsql
as $$
declare
  v_rating numeric;
  v_is_member boolean;
begin
  select is_member
  into v_is_member
  from players
  where id = p_player_id;

  if v_is_member is distinct from true then
    -- Vãng lai hoặc không tồn tại: không có Elo
    return null;
  end if;

  select eh.rating_after
  into v_rating
  from elo_history eh
  where eh.player_id = p_player_id
  order by eh.created_at desc
  limit 1;

  if v_rating is null then
    -- Member nhưng chưa có history → Elo khởi tạo 1000
    return 1000;
  end if;

  return v_rating;
end;
$$;

-- RPC: set Elo khởi tạo cho player mới (dùng cho Quick Add Player)
create or replace function public.set_initial_rating(
  p_player_id uuid,
  p_rating numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into elo_history(
    player_id,
    tournament_id,
    rating_before,
    rating_after,
    delta,
    created_at
  )
  values (
    p_player_id,
    null,
    p_rating,
    p_rating,
    0,
    now()
  );
end;
$$;


-- RPC: cập nhật tỉ số trận (KHÔNG tính Elo – Elo chỉ tính khi finalize tournament)
create or replace function public.update_match_score(
  p_match_id uuid,
  p_score_a int[],
  p_score_b int[]
)
returns void
language plpgsql
as $$
declare
  v_match              matches%rowtype;
  v_wins_a             int := 0;
  v_wins_b             int := 0;
  v_i                  int;
begin
  -- 1. Lấy match + tournament, khóa hàng match để tránh race condition
  select m.*
  into v_match
  from matches m
  where m.id = p_match_id
  for update;

  if not found then
    raise exception 'match % not found', p_match_id;
  end if;

  -- 2. Tính số set thắng để xác định winner
  if array_length(p_score_a, 1) is null
     or array_length(p_score_b, 1) is null
     or array_length(p_score_a, 1) <> array_length(p_score_b, 1)
  then
    raise exception 'Score arrays must have same non-null length';
  end if;

  for v_i in 1..array_length(p_score_a, 1) loop
    if p_score_a[v_i] > p_score_b[v_i] then
      v_wins_a := v_wins_a + 1;
    elsif p_score_b[v_i] > p_score_a[v_i] then
      v_wins_b := v_wins_b + 1;
    end if;
  end loop;

  if v_wins_a = v_wins_b then
    -- Cho phép hoà, nếu bạn không muốn thì raise exception tại đây
    v_match.winner_entry_id := null;
  elsif v_wins_a > v_wins_b then
    v_match.winner_entry_id := v_match.entry_a_id;
  else
    v_match.winner_entry_id := v_match.entry_b_id;
  end if;

  -- 3. Cập nhật điểm và trạng thái trận
  update matches
  set score_a = p_score_a,
      score_b = p_score_b,
      status  = 'finished',
      winner_entry_id = v_match.winner_entry_id,
      updated_at = now()
  where id = p_match_id;
end;
$$;


-- RPC: finalize thứ hạng giải + (tuỳ chọn) Elo bonus theo vị trí
-- RPC: áp dụng Elo theo xếp hạng cuối cùng
--  - Top 3: cộng Elo theo weight hiện tại
--  - Còn lại: trừ Elo theo weight đảo ngược (hạng càng thấp trừ càng nhiều)
-- Công thức:
--  - Dựa trên bảng tournament_standings (đã được lưu bởi client)
--  - Dùng k_factor của tournament
--  - Tính 2 loại weight cho từng entry:
--      win_weight  = (N - position + 1) * (1 + points / maxPoints)
--      lose_weight = (position - 3) * (1 + (maxPoints - points) / maxPoints)
--  - Top 3:
--      gain_ratio = win_weight / sum(win_weight_top3)
--      delta = + round(k_factor * gain_ratio)
--  - Các vị trí còn lại:
--      loss_ratio = lose_weight / sum(lose_weight_rest)
--      delta = - round(k_factor * LOSS_SCALE * loss_ratio)
--      (LOSS_SCALE = 0.5 để phạt nhẹ hơn)
--  - Với doubles: delta chia đều cho các player trong team.
create or replace function public.apply_final_rank_elo(
  p_tournament_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_k_factor          numeric := 32;
  v_n_entries         int;
  v_max_points        numeric := 0;
  v_sum_win_weight    numeric := 0;
  v_sum_lose_weight   numeric := 0;
  -- v_loss_scale: hệ số phạt cho nhóm xếp hạng thấp.
  -- Rule cũ: thua bị trừ nhẹ hơn (50% so với tổng K).
  v_loss_scale        numeric := 0.5;

  v_entry_id          uuid;
  v_position          int;
  v_points            numeric;
  v_win_weight        numeric;
  v_lose_weight       numeric;
  v_delta             numeric;

  v_players           uuid[];
  v_player_id         uuid;
  v_player_rating     numeric;
  v_team_size         int;
begin
  -- Lấy k_factor từ tournaments
  select coalesce(k_factor::numeric, 32)
  into v_k_factor
  from tournaments
  where id = p_tournament_id;

  -- Nếu chưa có standings thì thoát
  if not exists (
    select 1
    from tournament_standings
    where tournament_id = p_tournament_id
  ) then
    return;
  end if;

  -- Tạo bảng tạm cho standings của giải
  create temporary table tmp_final_standings on commit drop as
  select
    position,
    entry_id,
    points::numeric as points,
    0::numeric      as win_weight,
    0::numeric      as lose_weight
  from tournament_standings
  where tournament_id = p_tournament_id
  order by position;

  select count(*), coalesce(max(points), 0)
  into v_n_entries, v_max_points
  from tmp_final_standings;

  if v_max_points <= 0 then
    v_max_points := 1;
  end if;

  -- Tính weight cho từng entry
  -- Lưu ý: Supabase bật extension "safeupdate" nên UPDATE phải có mệnh đề WHERE
  update tmp_final_standings
  set
    -- Weight cộng cho top 3: giữ nguyên công thức cũ
    win_weight = (v_n_entries - position + 1) * (1 + (points / v_max_points)),
    -- Weight trừ cho nhóm còn lại: đảo ngược theo position + điểm
    -- position càng lớn => lose_weight càng lớn
    lose_weight = greatest(position - 3, 0) * (1 + ((v_max_points - points) / v_max_points))
  where true;

  -- Tổng weight cho top 3 và phần còn lại
  select coalesce(sum(win_weight), 0)
  into v_sum_win_weight
  from tmp_final_standings
  where position <= 3;

  select coalesce(sum(lose_weight), 0)
  into v_sum_lose_weight
  from tmp_final_standings
  where position > 3;

  -- Duyệt từng entry để tính delta Elo
  for v_position, v_entry_id, v_points, v_win_weight, v_lose_weight in
    select position, entry_id, points, win_weight, lose_weight
    from tmp_final_standings
    order by position
  loop
    v_delta := 0;

    if v_position <= 3 and v_sum_win_weight > 0 then
      -- Top 3 được cộng Elo
      v_delta := round(v_k_factor * (v_win_weight / v_sum_win_weight));
    elsif v_position > 3 and v_sum_lose_weight > 0 then
      -- Các hạng còn lại bị trừ Elo (hạng càng thấp trừ càng nhiều)
      v_delta := - round(v_k_factor * v_loss_scale * (v_lose_weight / v_sum_lose_weight));
    end if;

    if v_delta = 0 then
      continue;
    end if;

    -- Lấy players cho entry này (singles hoặc doubles)
    select array_agg(te.player_id)
    into v_players
    from tournament_entries te
    where te.id = v_entry_id
      and te.player_id is not null;

    if v_players is null then
      select array_agg(tp.player_id)
      into v_players
      from tournament_entries te
      join team_players tp on tp.team_id = te.team_id
      where te.id = v_entry_id;
    end if;

    v_team_size := 0;
    if v_players is not null then
      foreach v_player_id in array v_players loop
        v_player_rating := public.get_current_rating(v_player_id);
        if v_player_rating is not null then
          v_team_size := v_team_size + 1;
        end if;
      end loop;
    end if;

    if v_team_size = 0 then
      continue;
    end if;

    -- Chia delta đều cho các player trong entry
    if v_players is not null then
      foreach v_player_id in array v_players loop
        v_player_rating := public.get_current_rating(v_player_id);
        if v_player_rating is not null then
          insert into elo_history(
            player_id,
            tournament_id,
            rating_before,
            rating_after,
            delta,
            created_at
          )
          values (
            v_player_id,
            p_tournament_id,
            v_player_rating,
            v_player_rating + (v_delta / v_team_size),
            (v_delta / v_team_size),
            now()
          );
        end if;
      end loop;
    end if;
  end loop;
end;
$$;
