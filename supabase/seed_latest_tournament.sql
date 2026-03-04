-- Seed sample cho latest tournament
-- Mục tiêu: đảm bảo view latest_tournament_summary_view luôn có ít nhất 1 dòng
-- Cách dùng:
--   1. Chạy seed_players.sql trước (để có players mẫu)
--   2. Chạy file này trong Supabase SQL Editor (chỉ cần chạy 1 lần)
--
-- File này sẽ:
--   - Tạo 1 tournament status = 'finished'
--   - Lấy 2 player đầu tiên làm entries
--   - Tạo standings với champion (position = 1)

do $$
declare
  v_tournament_id uuid;
  v_player_1_id   uuid;
  v_player_2_id   uuid;
  v_entry_1_id    uuid;
  v_entry_2_id    uuid;
begin
  -- Lấy 2 players đầu tiên (ưu tiên is_member = true)
  select id
  into v_player_1_id
  from public.players
  where is_member = true
  order by created_at
  limit 1;

  select id
  into v_player_2_id
  from public.players
  where is_member = true
  and id <> v_player_1_id
  order by created_at
  limit 1;

  if v_player_1_id is null or v_player_2_id is null then
    raise notice 'Cần ít nhất 2 players (is_member = true). Hãy chạy seed_players.sql trước.';
    return;
  end if;

  -- Xoá tournament mẫu cũ (nếu có) để tránh trùng tên
  delete from public.tournaments
  where name = 'Sample Latest Tournament';

  -- 1. Tạo tournament đã finished
  insert into public.tournaments (
    name,
    cover_image_url,
    k_factor,
    status,
    format,
    start_date,
    end_date
  )
  values (
    'Sample Latest Tournament',
    'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=900',
    32,
    'finished',
    'singles',
    current_date - 7,
    current_date - 5
  )
  returning id into v_tournament_id;

  -- 2. Tạo tournament entries (2 người)
  -- Mỗi INSERT chỉ trả về 1 dòng để tránh lỗi "query returned more than one row"
  insert into public.tournament_entries (tournament_id, player_id, seed)
  values (v_tournament_id, v_player_1_id, 1)
  returning id into v_entry_1_id;

  insert into public.tournament_entries (tournament_id, player_id, seed)
  values (v_tournament_id, v_player_2_id, 2)
  returning id into v_entry_2_id;

  -- 3. Tạo standings: champion = entry_1 (position = 1)
  -- Xoá standings cũ cho giải này (nếu có)
  delete from public.tournament_standings
  where tournament_id = v_tournament_id;

  insert into public.tournament_standings (
    tournament_id,
    entry_id,
    position,
    wins,
    losses,
    points
  )
  values
    (v_tournament_id, v_entry_1_id, 1, 1, 0, 100),
    (v_tournament_id, v_entry_2_id, 2, 0, 1, 50);

  raise notice 'Đã tạo sample latest tournament với id = %', v_tournament_id;
  raise notice 'View latest_tournament_summary_view sẽ trả về giải này.';
end $$;

