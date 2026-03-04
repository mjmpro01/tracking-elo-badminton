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
create or replace function public.finalize_tournament_rankings(
  p_tournament_id uuid,
  p_ordered_entry_ids uuid[]
)
returns void
language plpgsql
as $$
declare
  v_idx             int;
  v_entry_id        uuid;
  v_bonus_delta     numeric;
  v_players         uuid[];
  v_player_id       uuid;
  v_player_rating   numeric;
  v_team_size       int;
  v_tournament      tournaments%rowtype;
begin
  -- 1. Cập nhật position trong standings
  v_idx := 1;
  foreach v_entry_id in array p_ordered_entry_ids loop
    update tournament_standings
    set position = v_idx
    where tournament_id = p_tournament_id
      and entry_id = v_entry_id;
    v_idx := v_idx + 1;
  end loop;

  select *
  into v_tournament
  from tournaments
  where id = p_tournament_id;

  -- 2. Elo bonus dựa trên bảng cấu hình (tuỳ chọn)
  -- Bảng gợi ý:
  -- tournament_rank_bonus(tournament_id uuid, position_from int, position_to int, bonus_delta numeric)
  for v_idx in 1..array_length(p_ordered_entry_ids, 1) loop
    v_entry_id := p_ordered_entry_ids[v_idx];

    select trb.bonus_delta
    into v_bonus_delta
    from tournament_rank_bonus trb
    where trb.tournament_id = p_tournament_id
      and v_idx between trb.position_from and trb.position_to
    limit 1;

    if v_bonus_delta is null then
      continue;
    end if;

    -- Lấy players cho entry này (singles/doubles giống như trong update_match_score)
    select array_agg(te.player_id)
    into v_players
    from tournament_entries te
    where te.id = v_entry_id
      and te.player_id is not null;

    if v_players is null then
      select array_agg(tp.player_id)
      into v_players
      from tournament_entries te
      join teams tm on tm.id = te.team_id
      join team_players tp on tp.team_id = tm.id
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

    -- Mỗi player member trong đội nhận bonus_delta / team_size
    if v_players is not null then
      foreach v_player_id in array v_players loop
        v_player_rating := public.get_current_rating(v_player_id);
        if v_player_rating is not null then
          insert into elo_history(
            player_id,
            match_id,
            tournament_id,
            rating_before,
            rating_after,
            delta,
            created_at
          )
          values (
            v_player_id,
            null, -- bonus theo thứ hạng, không gắn match cụ thể
            p_tournament_id,
            v_player_rating,
            v_player_rating + (v_bonus_delta / v_team_size),
            (v_bonus_delta / v_team_size),
            now()
          );
        end if;
      end loop;
    end if;
  end loop;

  -- 3. Khóa giải
  update tournaments
  set status = 'locked'
  where id = p_tournament_id;
end;
$$;

