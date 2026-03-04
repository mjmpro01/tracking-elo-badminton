-- Seed ví dụ cho bảng tournament_rank_bonus
-- Rule: Elo theo hạng, zero-sum, N=8 entries
-- Có thể copy từng block vào Supabase SQL editor và chỉnh lại tournament_id cho từng giải.

-- Thay giá trị UUID này bằng id của tournament thật trong Supabase
-- select id from public.tournaments;
do $$
declare
  v_tournament_id uuid := '00000000-0000-0000-0000-000000000000'; -- TODO: sửa thành id giải thực tế
begin
  -- Xoá cấu hình cũ (nếu có) cho giải này
  delete from public.tournament_rank_bonus
  where tournament_id = v_tournament_id;

  -- Hạng 1: +40
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 1, 1, 40);

  -- Hạng 2: +25
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 2, 2, 25);

  -- Hạng 3: +10
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 3, 3, 10);

  -- Hạng 4: 0
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 4, 4, 0);

  -- Hạng 5: -5
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 5, 5, -5);

  -- Hạng 6: -10
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 6, 6, -10);

  -- Hạng 7: -20
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 7, 7, -20);

  -- Hạng 8: -40
  insert into public.tournament_rank_bonus (tournament_id, position_from, position_to, bonus_delta)
  values (v_tournament_id, 8, 8, -40);
end $$;

