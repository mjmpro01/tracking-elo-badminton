# Hướng dẫn tải iOS Simulator Runtime

## Cách 1: Tải từ Xcode (Khuyến nghị)

### Bước 1: Mở Xcode Settings
1. Mở Xcode
2. Vào menu: **Xcode** → **Settings** (hoặc **Preferences** trên macOS cũ)
   - Hoặc nhấn: `Cmd + ,` (Command + dấu phẩy)

### Bước 2: Vào tab Platforms (hoặc Components)
1. Chọn tab **Platforms** (hoặc **Components** trên Xcode cũ hơn)
2. Bạn sẽ thấy danh sách các iOS Simulator runtime có sẵn

### Bước 3: Tải iOS Simulator Runtime
1. Tìm **iOS Simulator** trong danh sách
2. Nhấn nút **Download** (biểu tượng mũi tên xuống) bên cạnh version bạn muốn
3. Chờ tải xuống (có thể mất 10-30 phút tùy version và tốc độ mạng)

### Bước 4: Kiểm tra
- Sau khi tải xong, runtime sẽ hiển thị với dấu tích ✅
- Bạn có thể tạo simulator mới với runtime đó

---

## Cách 2: Tải từ Command Line

### Kiểm tra các runtime có sẵn:
```bash
xcrun simctl list runtimes
```

### Tải iOS Simulator runtime:
```bash
# Tải iOS Simulator runtime mới nhất
xcodebuild -downloadPlatform iOS

# Hoặc tải runtime cụ thể (nếu có)
xcodebuild -downloadAllPlatforms
```

### Kiểm tra các platform có thể tải:
```bash
xcodebuild -downloadPlatform iOS -showAvailablePlatforms
```

---

## Cách 3: Tải từ Xcode Command Line Tools

Nếu bạn chỉ cần Command Line Tools (không cần full Xcode):
```bash
xcode-select --install
```

---

## Kiểm tra Simulator đã tải

### Xem danh sách runtimes:
```bash
xcrun simctl list runtimes
```

### Xem danh sách devices:
```bash
xcrun simctl list devices
```

### Tạo simulator mới:
```bash
# Tạo simulator với runtime đã tải
xcrun simctl create "iPhone Test" "iPhone 15" "iOS-26-3"
```

---

## Troubleshooting

### Nếu không thấy nút Download:
- Đảm bảo bạn đã đăng nhập Apple ID trong Xcode
- Xcode → Settings → Accounts → Thêm Apple ID

### Nếu tải bị lỗi:
- Kiểm tra kết nối mạng
- Thử tải lại từ Xcode Settings
- Xóa cache: `rm -rf ~/Library/Caches/com.apple.dt.Xcode`

### Nếu runtime không hiển thị:
- Restart Xcode
- Chạy: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
