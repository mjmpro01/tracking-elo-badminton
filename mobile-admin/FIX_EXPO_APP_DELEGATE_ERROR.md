# Sửa lỗi "Cannot find 'ExpoAppDelegate'"

## Đã hoàn thành:
✅ Đã chạy `pod install` lại - thành công

## Các bước tiếp theo trong Xcode:

### Bước 1: Clean Build Folder

1. Trong Xcode, vào menu: **Product** → **Clean Build Folder**
   - Hoặc nhấn phím tắt: **Shift + Cmd + K**

2. Đợi Xcode clean xong (sẽ mất vài giây)

### Bước 2: Đóng và mở lại Xcode (Tùy chọn nhưng khuyến nghị)

1. **Quit Xcode** hoàn toàn (Cmd + Q)
2. Mở lại workspace:
   ```bash
   open ios/mobileadmin.xcworkspace
   ```

### Bước 3: Build lại

1. Đảm bảo đã chọn **"Poem"** (iPhone) làm target
2. Nhấn **Product** → **Build** (Cmd + B)
   - Hoặc nhấn **Play** (▶️) để build và chạy

---

## Nếu vẫn còn lỗi:

### Option 1: Prebuild lại iOS project

```bash
cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

# Xóa thư mục ios cũ
rm -rf ios

# Prebuild lại
npx expo prebuild -p ios --clean

# Cài pods
cd ios
pod install
cd ..

# Mở lại Xcode
open ios/mobileadmin.xcworkspace
```

### Option 2: Kiểm tra AppDelegate

Đảm bảo file `ios/mobileadmin/AppDelegate.swift` có import đúng:

```swift
import ExpoModulesCore
```

---

## Lưu ý:

- **Lần đầu build** có thể mất 5-10 phút
- **Đảm bảo đã pair iPhone** với Xcode trước khi build
- **Kiểm tra Signing** đã được cấu hình đúng
