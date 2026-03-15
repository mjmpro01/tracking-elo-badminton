# Hướng dẫn gỡ cài đặt iOS 26 Simulator Runtime

## Cách 1: Xóa từ Xcode Settings (Khuyến nghị)

### Bước 1: Mở Xcode Settings
1. Mở Xcode
2. Vào menu: **Xcode** → **Settings** (hoặc **Preferences** trên macOS cũ)
   - Hoặc nhấn: `Cmd + ,` (Command + dấu phẩy)

### Bước 2: Vào tab Platforms
1. Chọn tab **Platforms** (hoặc **Components** trên Xcode cũ hơn)
2. Bạn sẽ thấy danh sách các iOS Simulator runtime đã cài đặt

### Bước 3: Xóa iOS 26 Runtime
1. Tìm **iOS 26.3 Simulator** (hoặc iOS 26.x) trong danh sách
2. Nhấn nút **Remove** (🗑️) hoặc **Delete** bên cạnh
3. Xác nhận xóa nếu được hỏi

### Bước 4: Kiểm tra
Sau khi xóa, kiểm tra lại:
```bash
xcrun simctl list runtimes
```

---

## Cách 2: Xóa thư mục runtime (Nếu cách 1 không hoạt động)

### Tìm thư mục runtime:
```bash
# Tìm các thư mục iOS 26
find ~/Library/Developer -name "*iOS-26*" -o -name "*26.3*" 2>/dev/null
```

### Xóa thư mục:
```bash
# Xóa iOS 26.3 runtime
rm -rf ~/Library/Developer/CoreSimulator/Runtimes/iOS-26-3.simruntime

# Hoặc xóa tất cả iOS 26
rm -rf ~/Library/Developer/CoreSimulator/Runtimes/iOS-26*.simruntime
```

### Kiểm tra lại:
```bash
xcrun simctl list runtimes
```

---

## Cách 3: Sử dụng xcodebuild (Nếu có quyền)

```bash
# Xóa component (cần runtime identifier chính xác)
xcodebuild -deleteComponent com.apple.CoreSimulator.SimRuntime.iOS-26-3
```

---

## Lưu ý:

⚠️ **Cảnh báo:**
- Gỡ cài đặt iOS 26 runtime sẽ xóa tất cả simulators sử dụng runtime này
- Bạn sẽ không thể chạy app trên iOS 26 simulator nữa
- Nếu cần lại, bạn sẽ phải tải lại từ Xcode Settings

✅ **Sau khi xóa:**
- Restart Xcode để cập nhật danh sách
- Các simulator devices sử dụng iOS 26 sẽ không hoạt động
- Bạn có thể tạo simulator mới với runtime khác

---

## Kiểm tra sau khi xóa:

```bash
# Xem các runtime còn lại
xcrun simctl list runtimes

# Xem các devices (sẽ không có iOS 26 nữa)
xcrun simctl list devices
```
