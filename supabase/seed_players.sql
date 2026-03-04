-- Seed sample players cho hệ thống badminton-tracking-elo
-- Có thể copy file này vào Supabase SQL Editor và chạy một lần.

insert into public.players (full_name, avatar_url, is_member, is_active)
values
  ('Nguyễn Văn A', 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA', true,  true),
  ('Trần Thị B',   'https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB', true,  true),
  ('Lê Văn C',     'https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC', true,  true),
  ('Phạm Thị D',   'https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThiD', true,  true),
  ('Hoàng Văn E',  'https://api.dicebear.com/7.x/avataaars/svg?seed=HoangVanE', true,  true),
  ('Guest Player 1', null, false, true),
  ('Guest Player 2', null, false, true);

