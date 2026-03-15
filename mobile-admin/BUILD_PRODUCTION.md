# Hướng dẫn Build Production

## Cách 1: Build với EAS Build (Khuyến nghị - Dễ nhất)

### Bước 1: Cài đặt EAS CLI (nếu chưa có)
```bash
npm install -g eas-cli
```

### Bước 2: Đăng nhập Expo account
```bash
eas login
```

### Bước 3: Cấu hình project
```bash
cd mobile-admin
eas build:configure
```

### Bước 4: Build iOS Production
```bash
# Build cho iOS (App Store)
eas build --platform ios --profile production

# Hoặc build cho Android
eas build --platform android --profile production

# Hoặc build cả hai
eas build --platform all --profile production
```

### Bước 5: Submit lên App Store / Play Store (tùy chọn)
```bash
# Submit iOS lên App Store
eas submit --platform ios

# Submit Android lên Play Store
eas submit --platform android
```

---

## Cách 2: Build Local (iOS - Cần Mac + Xcode)

### Bước 1: Cập nhật app.json cho production

Cần đổi bundle identifier từ `com.mobileadmin.app.dev` sang production:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.mobileadmin.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.mobileadmin.app",
      "versionCode": 1
    }
  }
}
```

### Bước 2: Build iOS với Xcode

```bash
cd mobile-admin/ios

# Prebuild (tạo native code)
npx expo prebuild --clean

# Mở Xcode
open ios/mobileadmin.xcworkspace
```

Trong Xcode:
1. Chọn scheme: **mobileadmin** → **Any iOS Device**
2. Product → Archive
3. Sau khi archive xong, chọn **Distribute App**
4. Chọn **App Store Connect** hoặc **Ad Hoc** / **Enterprise**

### Bước 3: Build Android Local

```bash
cd mobile-admin

# Prebuild
npx expo prebuild --clean

# Build APK
cd android
./gradlew assembleRelease

# File APK sẽ ở: android/app/build/outputs/apk/release/app-release.apk

# Hoặc build AAB (cho Play Store)
./gradlew bundleRelease
# File AAB sẽ ở: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Cách 3: Build với Expo Go (Không khuyến nghị cho Production)

Expo Go chỉ dùng cho development, không phù hợp cho production.

---

## Checklist trước khi build Production:

### ✅ Cấu hình cần kiểm tra:

1. **app.json:**
   - [ ] Bundle Identifier (iOS) và Package (Android) đúng
   - [ ] Version và buildNumber đúng
   - [ ] Icon và splash screen đã có
   - [ ] Permissions đã được khai báo đúng

2. **Code:**
   - [ ] Đã remove console.log không cần thiết
   - [ ] Đã set production API endpoints
   - [ ] Đã tắt debug mode
   - [ ] Đã test kỹ trên device thật

3. **Assets:**
   - [ ] Icon đã có đủ kích thước
   - [ ] Splash screen đã có
   - [ ] Images đã được optimize

4. **Signing:**
   - [ ] iOS: Đã có Apple Developer account và certificates
   - [ ] Android: Đã có keystore cho signing

---

## Lưu ý quan trọng:

### iOS:
- Cần Apple Developer account ($99/năm)
- Cần certificates và provisioning profiles
- Build time: 15-30 phút (với EAS) hoặc local

### Android:
- Có thể build APK local miễn phí
- Để upload Play Store cần keystore
- Build time: 5-15 phút

### EAS Build vs Local Build:

| | EAS Build | Local Build |
|---|---|---|
| **Dễ dùng** | ✅ Rất dễ | ⚠️ Phức tạp hơn |
| **Cần setup** | Chỉ cần EAS CLI | Cần Xcode/Android Studio |
| **Tốc độ** | 15-30 phút | 5-15 phút (local) |
| **Chi phí** | Free tier có giới hạn | Miễn phí |
| **Khuyến nghị** | ✅ Cho người mới | Cho người có kinh nghiệm |

---

## Scripts hữu ích:

### Build production với EAS:
```bash
# iOS
eas build --platform ios --profile production

# Android  
eas build --platform android --profile production

# Cả hai
eas build --platform all --profile production
```

### Kiểm tra build status:
```bash
eas build:list
```

### Download build:
Sau khi build xong, EAS sẽ cung cấp link download hoặc bạn có thể:
```bash
eas build:list
# Tìm build ID và download
```
