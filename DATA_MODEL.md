### Data model & chiến lược query (Supabase Postgres)

#### 1. Thực thể chính

- **players**
  - Trường gợi ý:
    - `id uuid primary key`
    - `full_name text not null`
    - `club_id uuid null`
    - `is_member boolean not null default true` -- phân biệt thành viên chính thức vs vãng lai
    - `handedness text null` -- 'L'/'R' nếu cần
    - `gender text null` -- 'M'/'F'/'X'
    - `created_at timestamptz default now()`
    - `is_active boolean default true`

- **clubs**
  - `id uuid primary key`
  - `name text not null`
  - `location text null`
  - `created_at timestamptz default now()`

- **seasons**
  - `id uuid primary key`
  - `club_id uuid references clubs`
  - `name text not null` -- ví dụ "2024–2025"
  - `start_date date`
  - `end_date date`
  - Index (club_id, start_date).

- **tournaments**
  - `id uuid primary key`
  - `club_id uuid references clubs`
  - `season_id uuid references seasons`
  - `name text not null`
  - `k_factor numeric not null default 32` -- hệ số K dùng cho tất cả trận trong giải
  - `status text not null` -- 'upcoming' | 'ongoing' | 'finished' | 'locked'
  - `format text not null` -- 'singles' | 'doubles' | 'mixed'
  - `start_date date`
  - `end_date date`
  - `created_at timestamptz default now()`
  - Index gợi ý:
    - `idx_tournaments_club_season` on `(club_id, season_id, start_date desc)`.

- **teams** (cho doubles/mixed)
  - `id uuid primary key`
  - `club_id uuid`
  - `name text null` -- optional alias
  - `created_at timestamptz default now()`

- **team_players**
  - `team_id uuid references teams`
  - `player_id uuid references players`
  - `role text null` -- 'A'/'B' nếu cần
  - primary key `(team_id, player_id)`.

- **tournament_entries**
  - Dòng đăng ký (player hoặc team) trong 1 giải.
  - `id uuid primary key`
  - `tournament_id uuid references tournaments`
  - `player_id uuid null`
  - `team_id uuid null`
  - Constraint: `CHECK ((player_id is not null) <> (team_id is not null))`
  - `seed int null`

- **matches**
  - `id uuid primary key`
  - `tournament_id uuid references tournaments`
  - `round text null` -- "Group A – R1", "Quarterfinal", ...
  - `court text null`
  - `scheduled_at timestamptz null`
  - `status text not null` -- 'scheduled' | 'in_progress' | 'finished' | 'pending_review' | 'cancelled'
  - `entry_a_id uuid references tournament_entries`
  - `entry_b_id uuid references tournament_entries`
  - `score_a int[] null` -- ví dụ [21, 19, 15]
  - `score_b int[] null`
  - `winner_entry_id uuid null references tournament_entries`
  - `created_at timestamptz default now()`
  - `updated_at timestamptz default now()`
  - Index:
    - `idx_matches_tournament_round` on `(tournament_id, scheduled_at desc)`.
    - `idx_matches_status_scheduled_at` on `(status, scheduled_at desc)`.

- **elo_history**
  - `id bigint generated always as identity primary key`
  - `player_id uuid references players`
  - `tournament_id uuid references tournaments`
  - `rating_before numeric not null`
  - `rating_after numeric not null`
  - `delta numeric not null`
  - `created_at timestamptz default now()`
  - Index:
    - `idx_elo_history_player_time` on `(player_id, created_at desc)`.

- **leaderboard_snapshot** (tùy chọn, nếu cần precompute)
  - `id bigint generated identity`
  - `player_id uuid`
  - `club_id uuid`
  - `season_id uuid`
  - `rating numeric not null`
  - `rank int not null`
  - `matches_played int`
  - `win_rate numeric`
  - `snapshot_at timestamptz default now()`

#### 2. View & query tối ưu (theo Supabase best practices)

- **View: `player_current_rating_view`**
  - Mục đích: lấy Elo hiện tại mỗi player.
  - Tối ưu:
    - Dùng `max(created_at)` trong `elo_history` group theo `player_id`.
    - Index `elo_history(player_id, created_at desc)`.
  - Sử dụng:
    - Cho leaderboard & player profile.

- **View: `leaderboard_view`**
  - Gồm:
    - `player_id`
    - `club_id`
    - `season_id`
    - `full_name`
    - `rating` (từ `player_current_rating_view`)
    - `rank` (dùng `dense_rank()` over rating desc per club/season).
    - `matches_played`, `win_rate` (join từ aggregate bảng matches).
  - Index:
    - `idx_leaderboard_club_season_rating` on `(club_id, season_id, rating desc)`.
  - Query:
    - Leaderboard web:
      - Filter theo `club_id`, `season_id`, order theo `rating desc`, limit + offset (hoặc cursor).

- **View: `player_matches_view`**
  - Mục đích: hiển thị lịch sử trận của 1 player (cho `/players/[id]`).
  - Cột gợi ý:
    - `player_id`
    - `match_id`
    - `tournament_id`
    - `opponent_name`
    - `result` ('W'/'L')
    - `score_text` (string hiển thị 21–19, 18–21, 21–17)
    - `delta`
    - `played_at` (từ `matches.scheduled_at` hoặc `updated_at`)
  - Index:
    - `idx_player_matches_player_time` on `(player_id, played_at desc)`.

- **View: `tournament_standings_view`**
  - Mục đích: bảng standings 1 giải cho `/tournaments/[id]`.
  - Cột:
    - `tournament_id`
    - `entry_id` (player/team)
    - `display_name`
    - `wins`, `losses`, `points`
    - `position` (rank trong giải)
    - `elo_delta_total` (sum delta trong `elo_history` cho match thuộc giải).
  - Index:
    - `idx_tournament_standings_tournament_pos` on `(tournament_id, position)`.

#### 3. RPC / function cho Elo & kết quả

- **RPC: `update_match_score`** (chỉ cập nhật kết quả, KHÔNG tính Elo)
  - Input:
    - `p_match_id uuid`
    - `p_score_a int[]` – điểm từng set cho A
    - `p_score_b int[]` – điểm từng set cho B
  - Logic high-level:
    1. Lấy match:
       - `select * from matches m where m.id = p_match_id for update;`
    2. Cập nhật `matches` (score + winner + status):
       - Set `score_a = p_score_a`, `score_b = p_score_b`.
       - Xác định team thắng/thua từ số set thắng:
         - `wins_a = count_i(p_score_a[i] > p_score_b[i])`, `wins_b` tương tự.
         - Nếu `wins_a > wins_b` → `winner_entry_id = entry_a_id`, ngược lại là `entry_b_id`.
       - Set `status = 'finished'`, `updated_at = now()`.
    3. Không đụng tới `elo_history`. Elo chỉ được tính khi **finalize standings của tournament**.
  - **Best practices áp dụng**:
    - Chạy trong `begin ... commit` ngắn, dùng `select ... for update` để khóa 1 hàng match duy nhất (tránh deadlock – `lock-short-transactions`, `lock-deadlock-prevention`).
    - Đảm bảo index trên `matches(status, tournament_id)` để load list trận hiệu quả.

- **RPC: `preview_match_elo`** (tuỳ chọn)
  - Input giống `update_match_score`, nhưng **không commit** thay đổi:
    - Tính Elo delta dựa trên score giả định và Elo hiện tại.
  - Dùng cho:
    - Admin app khi nhập tỉ số: hiển thị preview Elo +X/-Y.

- **RPC: `finalize_tournament_rankings`**
  - Input:
    - `p_tournament_id uuid`
    - `p_ordered_entry_ids uuid[]` – array entry_id theo thứ tự từ 1 → N.
  - Logic:
    1. Cập nhật `tournament_standings` (hoặc bảng backing):
       - Với mỗi index `i` trong `p_ordered_entry_ids`:
         - `update tournament_standings set position = i+1 where tournament_id = p_tournament_id and entry_id = p_ordered_entry_ids[i];`
    2. Elo theo thứ hạng chung cuộc (bonus theo vị trí):
       - Định nghĩa 1 bảng cấu hình, ví dụ `tournament_rank_bonus`:
         - `tournament_id`, `position_from`, `position_to`, `bonus_delta`.
       - Dựa trên `position`, tính `bonus_delta` cho từng entry.
       - Chia bonus đội cho từng player `is_member = true` giống như bước 6 ở trên và insert vào `elo_history`.
    3. Set trạng thái giải:
       - `update tournaments set status = 'locked' where id = p_tournament_id;`
  - Lưu ý:
    - RPC này **không** đổi kết quả từng trận, chỉ thêm/tinh chỉnh Elo dựa trên xếp hạng chung cuộc (nếu bạn áp dụng rule đó).

#### 4. Chiến lược query cho các màn hình chính

- **Web – Home leaderboard**
  - API / query:
    - `select * from leaderboard_view where club_id = ? and season_id = ? order by rating desc limit 50 offset ?`.
  - Best practice:
    - Dùng pagination (cursor/offset) – `data-pagination.md`.
    - Index `(club_id, season_id, rating desc)` để tránh sort chậm.

- **Web – Player profile**
  - Query Elo trend:
    - `select created_at, rating_after from elo_history where player_id = ? order by created_at asc`.
    - Có index `(player_id, created_at)` để scan nhanh.
  - Query stats tổng:
    - Sử dụng aggregate:
      - `count(*) matches_played`
      - `sum(case when delta > 0 then 1 end)` hoặc join từ `player_matches_view`.

- **Web – Tournament detail**
  - Standings:
    - `select * from tournament_standings_view where tournament_id = ? order by position asc`.
  - Matches:
    - `select * from matches where tournament_id = ? order by scheduled_at asc`.

- **Admin – Matches today**
  - Query:
    - `select * from matches where club_id = ? and status in ('scheduled','pending_review') and date(scheduled_at) = current_date order by scheduled_at asc`.
  - Index `(status, scheduled_at)` giúp duyệt nhanh.

#### 5. RLS & phân quyền

- **Role player (web public)**
  - Chỉ được `select` trên các view:
    - `leaderboard_view`, `player_current_rating_view`, `player_matches_view`, `tournament_standings_view`, `tournaments`.
  - Ràng buộc:
    - Không truy cập bảng raw như `elo_history` nếu không cần.

- **Role admin**
  - Được phép:
    - Gọi RPC `update_match_score`, `finalize_tournament_rankings`, `create_tournament`, `add_player_to_tournament`.
    - Insert/Update vào `matches`, `tournaments`, `players` (tuỳ mô hình).
  - Dùng `security-rls-basics`:
    - Bảng như `matches`, `tournaments` có RLS dựa trên `club_id` + mapping user → club.

#### 6. Tóm tắt liên kết với UX

- Web:
  - Leaderboard / profile / tournaments đọc từ `leaderboard_view`, `player_matches_view`, `tournament_standings_view`.
  - Không cần logic Elo trên client.
- Admin:
  - Nhập tỉ số & finalize standings chỉ gọi RPC:
    - `update_match_score` (per match).
    - `finalize_tournament_rankings` (per tournament).
  - UI tập trung vào UX; tính toán Elo & consistency nằm trong DB (theo hướng dẫn Supabase).

