# Hướng dẫn Build App cho Android và iOS

## Cách 1: Build Local (Development Build)

### Yêu cầu:
- **Android**: Android Studio, JDK, Android SDK
- **iOS**: Xcode (chỉ trên macOS), CocoaPods

### Android (Development Build)

```bash
cd mobile-admin

# 1. Prebuild (nếu chưa có thư mục android)
npx expo prebuild -p android

# 2. Build và chạy trên thiết bị/emulator
npx expo run:android

# Hoặc build APK trực tiếp
cd android
./gradlew assembleDebug
# APK sẽ ở: android/app/build/outputs/apk/debug/app-debug.apk
```

### iOS (Development Build)

```bash
cd mobile-admin

# 1. Prebuild (nếu chưa có thư mục ios)
npx expo prebuild -p ios

# 2. Cài đặt dependencies
cd ios
pod install
cd ..

# 3. Build và chạy trên thiết bị/simulator
npx expo run:ios

# Hoặc mở Xcode và build từ đó
open ios/mobileadmin.xcworkspace
```

---

## Cách 2: EAS Build (Cloud Build - Khuyên dùng)

### Bước 1: Cài đặt EAS CLI

```bash
npm install -g eas-cli
```

### Bước 2: Đăng nhập Expo

```bash
eas login
```

### Bước 3: Tạo file cấu hình EAS

```bash
cd mobile-admin
eas build:configure
```

File `eas.json` sẽ được tạo tự động.

### Bước 4: Build cho Android

```bash
# Development build
eas build --platform android --profile development

# Production build (APK)
eas build --platform android --profile production

# Production build (AAB - cho Google Play Store)
eas build --platform android --profile production --type app-bundle
```

### Bước 5: Build cho iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build (IPA)
eas build --platform ios --profile production
```

**Lưu ý iOS:**
- Cần Apple Developer Account ($99/năm)
- Cần cấu hình certificates và provisioning profiles
- EAS sẽ tự động xử lý nếu bạn đã đăng nhập

---

## Cách 3: Build Production APK/AAB (Android)

### Tạo file `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Build APK:

```bash
# Preview APK (có thể cài trực tiếp)
eas build --platform android --profile preview

# Production APK
eas build --platform android --profile production
```

Sau khi build xong, EAS sẽ cung cấp link download APK/IPA.

---

## Cách 4: Build trực tiếp từ Android Studio / Xcode

### Android Studio:

1. Mở Android Studio
2. File → Open → Chọn thư mục `mobile-admin/android`
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. APK sẽ ở: `app/build/outputs/apk/debug/app-debug.apk`

### Xcode:

1. Mở `mobile-admin/ios/mobileadmin.xcworkspace` trong Xcode
2. Chọn thiết bị hoặc "Any iOS Device"
3. Product → Archive
4. Sau khi archive xong, chọn "Distribute App" để tạo IPA

---

## Cấu hình cần thiết trước khi build

### Android (`app.json`):

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.mobileadmin",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### iOS (`app.json`):

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.mobileadmin",
      "buildNumber": "1.0.0"
    }
  }
}
```

---

## Lưu ý quan trọng

1. **Environment Variables**: Đảm bảo `.env.local` có đầy đủ:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2. **Assets**: Kiểm tra các file icon và splash screen trong `assets/`

3. **Permissions**: Kiểm tra permissions cho camera và storage (đã dùng trong app)

4. **Signing**:
   - **Android**: EAS tự động xử lý, hoặc tạo keystore thủ công
   - **iOS**: Cần Apple Developer Account và cấu hình trong Xcode

---

## Khuyến nghị

- **Development/Testing**: Dùng EAS Build với profile `preview` hoặc `development`
- **Production**: Dùng EAS Build với profile `production`
- **Nhanh nhất**: `eas build --platform android --profile preview` để có APK ngay
