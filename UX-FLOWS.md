### UX flows web & admin cho badminton tracking elo

#### 1. Web `@web-tracking-elo`

- **Mục tiêu**: Cho người chơi xem xếp hạng Elo, tìm kiếm player, xem profile, lịch sử giải và đọc rules.
- **Nguồn UI**: các file HTML xuất từ Stitch:
  - `web-tracking-elo/home-global-leaderboard/code.html`
  - `web-tracking-elo/players-directory/code.html`
  - `web-tracking-elo/unified-player-profile-header/code.html`
  - `web-tracking-elo/unified-tournament-details-header/code.html`
  - `web-tracking-elo/unified-tournament-history-header/code.html`
  - `web-tracking-elo/unified-rules-header/code.html`

#### 1.1 Sitemap & routing web (Next.js hoặc tương đương)

- `/` – **Home Global Leaderboard**
  - Hero giới thiệu hệ thống Elo (tên app: EloTracker / Badminton Elo).
  - Card “Latest Major Event” (giải gần nhất) với banner + nút “View Full Results”.
  - **Global leaderboard**:
    - Bảng xếp hạng top players (rank, player, Elo, change 30d, win rate, matches).
    - Search input “Search player or team…”.
  - Từ HTML `home-global-leaderboard/code.html`, giữ:
    - Header với nav: Leaderboard / Tournaments / Players / Rules.
    - Bố cục bảng và pagination, nhưng data sẽ lấy từ DB.

- `/players` – **Players Directory**
  - List/các card player với:
    - Avatar, tên, club, Elo hiện tại, rank tóm tắt.
  - Bộ lọc (có thể đặt trên cùng):
    - Text search theo tên.
    - Filter club/season.
    - Filter rank range hoặc skill tier (ví dụ: top 50, 51–200).
  - Bấm vào 1 player → đi tới `/players/[id]`.

- `/players/[id]` – **Player Profile**
  - Header (từ `unified-player-profile-header`):
    - Avatar, tên, club.
    - Current Elo, global rank, club rank.
  - Tabs nội dung:
    - `Overview`:
      - Tổng quan Elo hiện tại, Elo peak, số match đã chơi, win rate.
      - Mini card các thành tích nổi bật (best tournament, biggest Elo gain).
    - `Matches`:
      - Lịch sử trận gần nhất: ngày, đối thủ, giải, kết quả, Elo delta.
      - Pagination (cursor/offset).
    - `Tournaments`:
      - Các giải đã tham gia: tên giải, vị trí, Elo delta tổng.
  - Biểu đồ **Elo trend** theo thời gian (line chart đơn giản theo `elo_history`).

- `/tournaments` – **Tournaments List**
  - List giải dựa trên:
    - Tên giải, ngày, trạng thái: upcoming / ongoing / finished.
    - Số players, format (singles/doubles).
  - Filter:
    - Theo trạng thái (status).
    - Theo season, club.
  - Bấm vào 1 giải → `/tournaments/[id]`.

- `/tournaments/[id]` – **Tournament Details & History**
  - Layout ghép từ:
    - `unified-tournament-details-header`
    - `unified-tournament-history-header`
  - Nội dung chính:
    - Thông tin giải: tên, địa điểm, ngày, format, status.
    - Tabs:
      - `Overview`: summary, champion, top 3, tổng match.
      - `Standings`: bảng xếp hạng riêng của giải (rank, player/team, points, Elo delta trong giải).
      - `Matches`: danh sách trận của giải (round, cặp đấu, tỉ số, Elo delta).

- `/rules` – **Rules & Elo system**
  - Dùng layout `unified-rules-header`.
  - Sections:
    - `Cách tính Elo`: giải thích công thức cơ bản, ví dụ minh họa.
    - `Quy định giải`: format set, scoring, tie-break, walkover, v.v.
    - `Fair-play & dispute`: cách xử lý khi có tranh chấp, khi nào cần review/lock kết quả.

#### 1.2 Luồng người dùng web (player journey)

- Luồng 1 – Từ leaderboard đến chi tiết player:
  - Vào `/` → xem top leaderboard → search tên mình → click vào dòng → tới `/players/[id]` → xem Elo trend + lịch sử trận.
- Luồng 2 – Tìm giải rồi xem standings:
  - Vào `/tournaments` → filter theo status = finished → chọn giải gần nhất → `/tournaments/[id]` → tab `Standings` → xem hạng của mình/team.
- Luồng 3 – Tìm player khác để so sánh:
  - Vào `/players` → search người A, mở tab → back, search người B → mở tab khác → so sánh Elo, win rate.

---

#### 2. Admin mobile `@stitch/admin-mobile-tracking-elo`

- **Mục tiêu**: Admin nhập/duyệt kết quả, tạo & cấu hình giải, quản lý player và standings, tất cả trên mobile.
- **Nguồn UI**: các file HTML trong `admin-mobile-tracking-elo/`:
  - `refined-admin-login.html` – Login + chọn club/season.
  - `admin-dashboard-fixed-menu.html` – Dashboard với fixed bottom menu.
  - `tournaments-management-no-menu.html` – Danh sách giải.
  - `step1-create-tournament.html`, `step2-select-players.html`, `step3-singles-setup.html`, `step3-doubles-setup.html` – Flow tạo giải.
  - `tournament-review-*.html` – Review standings & confirm rankings.
  - `enter-edit-score.html` – Màn nhập/chỉnh sửa tỉ số.
  - `add-player-fixed-menu.html` – Thêm player.
  - `player-rankings-management.html` – Quản lý rankings/player trong giải.

#### 2.1 Flow điều hướng chính (React Navigation)

- **Stack**:
  - Auth stack:
    - `LoginScreen` (từ `refined-admin-login.html`):
      - Email/password / magic link.
      - Dropdown chọn club (nếu admin nhiều club).
    - Sau khi login → select season/club (có thể cùng màn hoặc tiếp theo).
  - Main stack:
    - `MainTabs` (bottom tabs giống `admin-dashboard-fixed-menu`):
      - `Dashboard` – màn chính.
      - `Tournaments` – quản lý giải.
      - `Matches` – trận hôm nay / theo giải.
      - `Players` – quản lý player.

#### 2.2 Luồng chi tiết theo nghiệp vụ

- **Luồng A – Login & chọn context**
  - Mở app → `LoginScreen` (refined-admin-login).
  - Nhập thông tin → submit → hệ thống tự gán admin vào club/season mặc định (hoặc từ cấu hình tài khoản) → chuyển sang `Dashboard`.

- **Luồng B – Dashboard admin**
  - Màn `admin-dashboard-fixed-menu`:
    - Card “Today’s Matches”: số trận scheduled, số trận pending score.
    - Card “Pending approvals”: số kết quả cần confirm / review.
    - Quick links:
      - “Enter Scores” → `Matches` tab, filter hôm nay.
      - “Create Tournament” → flow tạo giải (Luồng C).

- **Luồng C – Tạo giải (step1–3 + review)**
  - B1: `step1-create-tournament.html`
    - Nhập tên giải, ngày, location, k-factor để tính elo
  - B2: `step2-select-players.html`
    - Chọn Players nếu ko có thì có thể add player nhanh và player này sẽ ko có elo hay gọi là vãn lai
  - B3: Có thể chọn format giải (singles/Doubles)
    - B3 (Singles): `step3-singles-setup.html`
      - hiển thị danh sách players theo elo giảm dần
    - B3 (Doubles): `step3-doubles-setup.html`
      - Ghép đôi players thành cặp.
      - Thêm tính năng tự động ghép đôi để tổng điểm trung bình của đội gần bằng nhau với các đội khác, nếu có player vãn lai thì tính player có elo
  - B4: Review 
    - B4: Dành cho single `tournament-review-singles-f86b.html`
    - B4: Dành cho double `tournament-review-doubles-3176.html`

- **Luồng D – Nhập / chỉnh sửa tỉ số (+ Elo)**
  - Từ `Tournament` tab:
    - Thấy danh sách Tournament sắp xếp từ mới nhất đến cũ nhất `tournaments-management-no-menu.html`
    - Bấm 1 Tournament:
      - Hiển thị `create-match.html`
        - hiển thị nút create match, live stadings, kết quả cuối cùng, list trận đấu, trận đấu thì có thể edit score
      - Có nút create match thì dẫn tới `create-match-for-single-double.html`
      - Nút edit score thì dẫn tời `enter-edit-score.html`
      - Nút live stading: `live-standing-737d.html`
        - hiển thị list players/teams với số trận thắng hiện tại
      - Màn hình “Finalize Rankings”:  `finalize-raking.html`
        - List standings có thể drag-and-drop để chỉnh tay thứ hạng.
        - Chú thích: “This order will be used for Elo calculation”.
    - Bấm “Confirm Final Rankings”:
      - Chạy 1 RPC backend:
        - Khóa standings (status `locked`).
        - Chạy Elo adjust cuối cùng nếu có rule đặc biệt theo vị trí chung cuộc.
     
  - Trường hợp chỉnh sửa:
    - Mở lại trận đã có kết quả → `enter-edit-score.html` với giá trị cũ → cho phép sửa → lưu lại history change (audit trail).

- **Luồng F – Quản lý players**
  - Từ `Players` tab:
    - Màn `player-rankings-management.html`:
      - List players với rank hiện tại trong club/season.
      - Nút thêm player (`add-player-fixed-menu.html`):
        - Form: tên, giới tính, handedness (optional), club, email/phone (optional).
    - Từ player item:
      - Xem chi tiết mini stats.
      - Gắn player vào giải (nếu chưa assign).

---

#### 3. Ưu tiên UX cho MVP

- **Web (player-facing)**:
  - Trải nghiệm core: `/` (leaderboard) → `/players/[id]` → `/tournaments/[id]`.
  - Thời gian tải nhanh, đọc nhanh:
    - Ưu tiên server-side render + cache leaderboard & standings.
    - Filter/search phản hồi tức thì (client-side).
- **Admin mobile**:
  - Tối ưu thao tác tại sân:
    - Nhập tỉ số **1–2 tap** cho mỗi set.
    - Rõ ràng về trạng thái match (`scheduled` / `in_progress` / `finished` / `pending_review`).
  - Những thao tác phải “rất mượt”:
    - Mở app → login → thấy ngay “Today’s Matches”.
    - Vào 1 trận → điền tỉ số → confirm → quay lại list, trạng thái cập nhật tức thì (optimistic update).

