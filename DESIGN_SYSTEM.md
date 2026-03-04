### Design system chung cho web & admin mobile

#### 1. Brand & tokens cơ bản

- **Font**:
  - Web: `Lexend` (theo `home-global-leaderboard/code.html`).
  - Admin mobile: `Inter` (theo `tournament-review-doubles-*.html`).
  - Quy ước:
    - Heading: dùng weight 600–700.
    - Body: weight 400–500.

- **Màu sắc chủ đạo**
  - Từ web:
    - `primary` `#137fec`
    - `primary-dark` `#0b5bb0`
    - `primary-light` `#54a3f2`
    - `background-light` `#f6f7f8`
    - `background-dark` `#101922`
  - Từ admin mobile:
    - `primary` `#2b6cee`
    - `background-light` `#f6f6f8`
    - `background-dark` `#101622`
  - **Palette hợp nhất** (dùng cho cả web & mobile):
    - `primary`: `#137fec` (web) + giữ `#2b6cee` làm accent thứ hai.
    - `primaryMuted`: `#2b6cee` (mobile).
    - `bgDark`: `#050814`–`#101622` (background app).
    - `surfaceDark`: `#111827`–`#15202b`.
    - `surfaceLight`: `#ffffff`.
    - `border`: `#1f2937` (dark) / `#e5e7eb` (light).
    - `textMain`: `#f9fafb` (dark) / `#111827` (light).
    - `textMuted`: `#9ca3af`.
    - `success`: `#22c55e`.
    - `error`: `#ef4444`.
    - `warning`: `#facc15`.

- **Radius & shadow**
  - Web:
    - Card/table: radius 12–16px, shadow mềm (như trong leaderboards).
  - Mobile:
    - Border radius Tailwind: `lg: 0.5rem`, `xl: 0.75rem`.
  - Quy ước chung:
    - `radius.sm` ~ 6px – chip/badge.
    - `radius.md` ~ 8px – button, input.
    - `radius.lg` ~ 12px – card/table row.
    - `radius.xl` ~ 16–20px – bottom sheet, large cards.

#### 2. Component primitives (web)

- **Button**
  - Variants:
    - `primary`: nền `primary`, text trắng.
    - `secondary`: nền `surfaceDark`, border `border`, text `textMain`.
    - `ghost`: nền trong suốt, hover có overlay nhẹ.
  - Kích thước:
    - `sm` (height ~32), `md` (~36–40), `lg` (~44–48).
  - Loading state: spinner nhỏ bên trái label.

- **Input / Select**
  - Bo góc `radius.md`, border 1px.
  - Focus: border `primary`, shadow nhạt.
  - Placeholder dùng `textMuted`.

- **Tabs**
  - Tab line ở dưới, active tab có text đậm + underline (hoặc pill background).
  - Dùng cho:
    - Player Profile (`Overview` / `Matches` / `Tournaments`).
    - Tournament detail (`Overview` / `Standings` / `Matches`).

- **Card**
  - Sử dụng cho các section như:
    - Hero “Latest Major Event”.
    - Player info summary.
  - Padding 16–24px, border nhẹ, shadow nhỏ.

- **Table**
  - Leaderboard & standings:
    - Header có background hơi đậm, uppercase label nhỏ.
    - Row hover background mờ.
    - Cột numeric (Elo, matches, win rate) căn phải.

- **Badge / Tag**
  - Sử dụng màu cho status:
    - `upcoming`: xanh dương nhạt.
    - `ongoing`: xanh lá.
    - `finished`: xám.

- **Toast / Banner**
  - Dùng cho thông báo thao tác (success/error) khi submit form trên web.

#### 3. Component primitives (admin mobile)

- **ScreenContainer**
  - Bọc mỗi màn hình:
    - Áp dụng background, safe area, padding ngang chuẩn.
  - Phù hợp với React Navigation.

- **AppBar / Header**
  - Cho màn `enter-edit-score`, `tournament-review`, v.v:
    - Có nút back, tiêu đề, subtitle (tên giải / context).
    - Icon action phụ ở bên phải (ví dụ info).

- **PrimaryButton**
  - Full width, radius `xl`, chiều cao ~48px.
  - Dùng màu `primary`, shadow nhẹ.

- **ListItem**
  - Row chuẩn cho match, player, tournament:
    - Avatar/icon bên trái, nội dung giữa (tên, meta), action nhỏ bên phải.
    - Có variant:
      - `chevron` (link detail).
      - `checkbox` (select).
      - `action` (nút nhỏ).

- **Bottom navigation**
  - 4 tab:
    - `Dashboard`, `Tournaments`, `Matches`, `Players`.
  - Icon Material Symbols, text nhỏ bên dưới.

- **Bottom sheet / Modal**
  - Dùng cho:
    - Filter danh sách.
    - Xác nhận hành động (huỷ trận, lock standings).

- **Score counter**
  - Được dùng trong `enter-edit-score`:
    - Hiển thị số lớn (score) + hai nút `+`/`-`.
    - Tối ưu thao tác một tay (nút đủ lớn, khoảng cách hợp lý).

#### 4. Pattern chung & composition (áp dụng `vercel-composition-patterns`)

- **Layout shell**
  - Web:
    - `AppShell` – header (logo + nav) + content container (max width 1200px).
  - Admin mobile:
    - `AdminShell` – dùng bottom tab + stack, mọi screen con bọc trong `ScreenContainer`.

- **Compound components**
  - Ví dụ cho form nhập tỉ số:
    - `MatchScoreForm` với các phần:
      - `MatchScoreForm.Header` (tên giải, court, round).
      - `MatchScoreForm.TeamScore` (cho từng team).
      - `MatchScoreForm.Actions` (nút Save/Cancel).
    - Bên trong chia nhỏ, không truyền quá nhiều boolean prop.

- **State trong provider**
  - Cho admin app:
    - `TournamentProvider`, `MatchProvider`, `PlayerProvider` để quản lý state/phân quyền & provide tới các screen con.

#### 5. Mapping token → Tailwind / style (thực thi)

- **Web (Tailwind)**
  - Config gợi ý (đã thấy trong `home-global-leaderboard/code.html`):
    - `colors.primary = '#137fec'`.
    - `colors.background-light`, `colors.background-dark`.
    - `fontFamily.display = ['Lexend', 'sans-serif']`.
  - Cấu trúc class:
    - Background: `bg-background-light dark:bg-background-dark`.
    - Text: `text-slate-900 dark:text-slate-100`.
    - Border: `border-slate-200 dark:border-slate-800`.

- **Admin mobile (React Native / Tailwind-in-RN hoặc StyleSheet)**
  - Dùng cùng mã màu và radius như trên:
    - Đặt trong một module `theme.ts` (React Native).
  - Styles:
    - `screenBackground: bgDark`.
    - `cardBackground: surfaceDark`.
    - `primaryButton: backgroundColor primary, borderRadius xl`.

