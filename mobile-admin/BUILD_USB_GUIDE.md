# Hướng dẫn Build và Cài App Trực Tiếp Vào Máy Thật (USB)

## Android - Cài Trực Tiếp Qua USB

### Bước 1: Bật Developer Mode trên điện thoại Android

1. Vào **Settings** → **About phone**
2. Nhấn 7 lần vào **Build number** để bật Developer mode
3. Quay lại Settings → **Developer options**
4. Bật **USB debugging**
5. Kết nối điện thoại với máy tính qua USB
6. Chấp nhận "Allow USB debugging" trên điện thoại

### Bước 2: Kiểm tra kết nối

```bash
# Kiểm tra thiết bị đã kết nối
adb devices

# Nếu thấy device ID thì đã kết nối thành công
```

### Bước 3: Build và cài trực tiếp

```bash
cd mobile-admin

# Cách 1: Build và cài tự động (khuyên dùng)
npx expo run:android

# Cách 2: Build APK rồi cài thủ công
cd android
./gradlew assembleDebug
cd ..
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Lưu ý:** Lần đầu build có thể mất 5-10 phút để download dependencies.

---

## iOS - Cài Trực Tiếp Qua USB (macOS only)

### Bước 1: Cấu hình Apple Developer

1. Mở Xcode → **Preferences** → **Accounts**
2. Thêm Apple ID của bạn
3. Chọn team (có thể dùng Personal Team miễn phí)

### Bước 2: Kết nối iPhone

1. Kết nối iPhone với Mac qua USB
2. Mở iPhone → **Settings** → **General** → **Device Management**
3. Trust máy tính nếu được hỏi

### Bước 3: Build và cài trực tiếp

```bash
cd mobile-admin

# Cách 1: Build và cài tự động
npx expo run:ios --device

# Cách 2: Mở Xcode và build
open ios/mobileadmin.xcworkspace
# Trong Xcode:
# - Chọn iPhone của bạn ở thanh trên
# - Nhấn nút Play (▶️) hoặc Cmd+R
```

### Bước 4: Trust Developer trên iPhone (lần đầu)

Sau khi cài xong:
1. Vào **Settings** → **General** → **VPN & Device Management**
2. Tìm app của bạn → **Trust "Your Name"**
3. Nhấn **Trust**

---

## Troubleshooting

### Android - "adb: command not found"

```bash
# Cài đặt Android SDK Platform Tools
# macOS:
brew install android-platform-tools

# Hoặc download từ:
# https://developer.android.com/studio/releases/platform-tools
```

### Android - "No devices found"

```bash
# Kiểm tra USB debugging đã bật chưa
adb devices

# Nếu vẫn không thấy, thử:
adb kill-server
adb start-server
adb devices
```

### iOS - "No signing certificate found"

1. Mở Xcode → **Preferences** → **Accounts**
2. Chọn Apple ID → **Download Manual Profiles**
3. Hoặc chọn **Personal Team** trong Signing & Capabilities

### iOS - "Unable to install app"

- Đảm bảo đã trust developer trên iPhone
- Kiểm tra bundle identifier không trùng với app khác
- Xóa app cũ nếu đã cài trước đó

---

## Quick Commands

### Android:
```bash
# Build và cài trong 1 lệnh
npx expo run:android

# Hoặc build APK rồi cài
cd android && ./gradlew assembleDebug && cd .. && adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS:
```bash
# Build và cài trong 1 lệnh
npx expo run:ios --device

# Hoặc dùng Xcode
open ios/mobileadmin.xcworkspace
```

---

## Lưu ý

1. **Android**: Không cần account đặc biệt, chỉ cần bật USB debugging
2. **iOS**: Cần Apple ID (có thể dùng Personal Team miễn phí)
3. **Lần đầu build**: Sẽ mất thời gian để download dependencies
4. **Development build**: App sẽ chạy với Expo development tools
