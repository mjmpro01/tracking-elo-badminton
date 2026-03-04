-- Schema Supabase cho hệ thống badminton-tracking-elo
-- Có thể copy toàn bộ file này vào Supabase SQL Editor để chạy (có thể chia nhỏ nếu cần).

-- =====================
-- 1. BẢNG CƠ SỞ (không dùng club/multi-club, không dùng seasons)
-- =====================

create table if not exists public.players (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  avatar_url   text, -- URL ảnh đại diện của player
  is_member    boolean not null default true, -- true = thành viên chính thức, false = vãng lai
  handedness   text, -- 'L' | 'R'
  gender       text, -- 'M' | 'F' | 'X'
  created_at   timestamptz not null default now(),
  is_active    boolean not null default true
);

create index if not exists idx_players_active
  on public.players (is_active);


create table if not exists public.tournaments (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  cover_image_url text, -- URL ảnh cover của giải
  k_factor       numeric not null default 32, -- hệ số Elo cấu hình theo giải
  status         text not null default 'upcoming', -- upcoming | ongoing | finished | locked
  format         text not null, -- singles | doubles | mixed
  start_date     date,
  end_date       date,
  created_at     timestamptz not null default now()
);

create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  created_at  timestamptz not null default now()
);


create table if not exists public.team_players (
  team_id     uuid not null references public.teams(id) on delete cascade,
  player_id   uuid not null references public.players(id) on delete cascade,
  role        text, -- 'A' | 'B' | ...
  primary key (team_id, player_id)
);


-- entry đăng ký vào giải: có thể là player hoặc team
create table if not exists public.tournament_entries (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id     uuid references public.players(id) on delete cascade,
  team_id       uuid references public.teams(id) on delete cascade,
  seed          int,
  constraint tournament_entries_player_or_team_chk
    check (
      (player_id is not null and team_id is null)
      or (player_id is null and team_id is not null)
    )
);

create index if not exists idx_tournament_entries_tournament
  on public.tournament_entries (tournament_id);


create table if not exists public.matches (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid not null references public.tournaments(id) on delete cascade,
  status           text not null default 'scheduled', -- scheduled | in_progress | finished | pending_review | cancelled
  entry_a_id       uuid not null references public.tournament_entries(id) on delete cascade,
  entry_b_id       uuid not null references public.tournament_entries(id) on delete cascade,
  score_a          int[],
  score_b          int[],
  winner_entry_id  uuid references public.tournament_entries(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_matches_tournament_scheduled
  on public.matches (tournament_id, scheduled_at desc);

create index if not exists idx_matches_status_scheduled
  on public.matches (status, scheduled_at desc);


create table if not exists public.elo_history (
  id             bigint generated always as identity primary key,
  player_id      uuid not null references public.players(id) on delete cascade,
  tournament_id  uuid references public.tournaments(id) on delete set null,
  rating_before  numeric not null,
  rating_after   numeric not null,
  delta          numeric not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_elo_history_player_time
  on public.elo_history (player_id, created_at desc);


-- standings backing table (cho view / RPC finalize)
create table if not exists public.tournament_standings (
  tournament_id  uuid not null references public.tournaments(id) on delete cascade,
  entry_id       uuid not null references public.tournament_entries(id) on delete cascade,
  position       int, -- thứ hạng hiện tại
  wins           int default 0,
  losses         int default 0,
  points         int default 0,
  primary key (tournament_id, entry_id)
);

create index if not exists idx_tournament_standings_tournament_pos
  on public.tournament_standings (tournament_id, position);


-- bảng cấu hình bonus Elo theo thứ hạng chung cuộc (optional)
create table if not exists public.tournament_rank_bonus (
  id             bigint generated always as identity primary key,
  tournament_id  uuid not null references public.tournaments(id) on delete cascade,
  position_from  int not null,
  position_to    int not null,
  bonus_delta    numeric not null
);

create index if not exists idx_tournament_rank_bonus_tournament
  on public.tournament_rank_bonus (tournament_id);


-- =====================
-- 2. VIEW HỖ TRỢ WEB
-- =====================

-- rating hiện tại của mỗi player (dùng view cho dễ join)
create or replace view public.player_current_rating_view as
select
  p.id                         as player_id,
  p.full_name,
  p.avatar_url,
  coalesce(
    (
      select eh.rating_after
      from public.elo_history eh
      where eh.player_id = p.id
      order by eh.created_at desc
      limit 1
    ),
    case when p.is_member then 1000 else null end
  )                            as rating
from public.players p;


-- leaderboard_view: dùng cho trang / và /players
create or replace view public.leaderboard_view as
with latest_rating as (
  select
    pcrv.player_id,
    pcrv.full_name,
    pcrv.avatar_url,
    pcrv.rating
  from public.player_current_rating_view pcrv
  where pcrv.rating is not null
),
stats as (
  select
    eh.player_id,
    count(*) as matches_played,
    sum(case when eh.delta > 0 then 1 else 0 end)::numeric
      / nullif(count(*), 0)::numeric as win_rate
  from public.elo_history eh
  group by eh.player_id
)
select
  lr.player_id,
  lr.full_name,
  lr.avatar_url,
  lr.rating,
  row_number() over (
    order by lr.rating desc
  )                             as rank,
  coalesce(s.matches_played, 0) as matches_played,
  s.win_rate
from latest_rating lr
left join stats s on s.player_id = lr.player_id;


-- tournament_standings_view: standings chuẩn để web đọc
create or replace view public.tournament_standings_view as
select
  ts.tournament_id,
  ts.entry_id,
  ts.position,
  ts.wins,
  ts.losses,
  ts.points,
  coalesce(p.full_name, tm.name) as display_name
from public.tournament_standings ts
left join public.tournament_entries te on te.id = ts.entry_id
left join public.players p on p.id = te.player_id
left join public.teams tm on tm.id = te.team_id;


-- latest_tournament_summary_view: thông tin giải mới nhất (đã finished/locked)
create or replace view public.latest_tournament_summary_view as
with base as (
  select
    t.id,
    t.name,
    t.cover_image_url,
    t.status,
    t.start_date,
    t.end_date,
    t.created_at,
    -- tổng số entry
    (
      select count(*)
      from public.tournament_entries e
      where e.tournament_id = t.id
    ) as total_entries,
    -- tổng số trận
    (
      select count(*)
      from public.matches m
      where m.tournament_id = t.id
    ) as total_matches,
    -- champion (position = 1)
    (
      select coalesce(p.full_name, tm.name)
      from public.tournament_standings ts
      join public.tournament_entries te on te.id = ts.entry_id
      left join public.players p on p.id = te.player_id
      left join public.teams tm on tm.id = te.team_id
      where ts.tournament_id = t.id
        and ts.position = 1
      limit 1
    ) as champion_name
  from public.tournaments t
  where t.status in ('finished', 'locked')
),
ranked as (
  select
    *,
    row_number() over (
      order by coalesce(end_date, start_date, created_at) desc
    ) as rn
  from base
)
select
  id,
  name,
  cover_image_url,
  status,
  start_date,
  end_date,
  total_entries,
  total_matches,
  champion_name
from ranked
where rn = 1;


-- =====================
-- 3. GỢI Ý RLS (chỉ phác thảo, bật khi cần)
-- =====================
-- Bạn có thể bật RLS và thêm policy sau cho từng bảng:
--   alter table public.players enable row level security;
--   alter table public.tournaments enable row level security;
--   alter table public.matches enable row level security;
--   ...
-- Policies ví dụ:
--   - Web/public: chỉ select từ view (leaderboard_view, player_matches_view, tournament_standings_view)
--   - Admin: role riêng được phép gọi RPC update_match_score / finalize_tournament_rankings

