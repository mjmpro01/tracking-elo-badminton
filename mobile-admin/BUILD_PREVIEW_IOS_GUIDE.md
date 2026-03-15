# Hướng dẫn Build iOS Preview (cho iPhone thật)

## Preview Build là gì?

- ✅ JavaScript bundle đã được **embed sẵn** trong app
- ✅ **Không cần Metro bundler** - app chạy độc lập
- ✅ Có thể cài đặt lên iPhone thật
- ✅ App chạy offline hoàn toàn
- ✅ Phù hợp để test trên device thật

---

## Các bước build:

### Bước 1: Đăng nhập Expo account

```bash
cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin
eas login
```

- Nếu chưa có account, tạo tại: https://expo.dev (miễn phí)
- Hoặc đăng nhập bằng GitHub/Google

### Bước 2: Cấu hình project (nếu lần đầu)

```bash
eas build:configure
```

Sẽ tạo/update file `eas.json` với các build profiles.

### Bước 3: Build iOS Preview

```bash
eas build --platform ios --profile preview
```

**Hoặc chạy script tự động:**
```bash
./build_preview_ios.sh
```

### Bước 4: Chờ build hoàn tất

- Build time: **15-30 phút**
- Build chạy trên cloud của Expo
- Bạn có thể theo dõi tiến trình trên terminal hoặc https://expo.dev

### Bước 5: Kiểm tra build status

```bash
# Xem danh sách builds
eas build:list

# Xem chi tiết build mới nhất
eas build:view
```

### Bước 6: Download và cài đặt lên iPhone

Sau khi build xong, EAS sẽ cung cấp:

1. **QR code** - Scan bằng camera iPhone
2. **Link download** - Mở trên Safari iPhone
3. **File .ipa** - Download và cài đặt

**Cách cài đặt:**
- Mở link trên iPhone (Safari)
- Download file .ipa
- Cài đặt (có thể cần trust developer certificate)

**Lần đầu tiên:**
- Settings → General → VPN & Device Management
- Trust developer certificate

---

## Lưu ý:

### Với Apple ID miễn phí:
- ✅ Có thể build và cài lên iPhone
- ⚠️ App chỉ chạy được **7 ngày**
- ⚠️ Sau 7 ngày cần rebuild lại
- ⚠️ Tối đa 3 apps cùng lúc

### Với Apple Developer account ($99/năm):
- ✅ App chạy được **1 năm**
- ✅ Có thể distribute cho nhiều devices
- ✅ Không giới hạn số lượng apps

---

## So sánh với các build khác:

| Build Type | Cần Metro? | Thời gian | Phù hợp cho |
|------------|------------|-----------|-------------|
| **Development** | ✅ Có | 15-30 phút | Development với hot reload |
| **Preview** | ❌ Không | 15-30 phút | Test trên device thật |
| **Production** | ❌ Không | 15-30 phút | Publish App Store |

---

## Troubleshooting:

### Lỗi: "Not logged in"
```bash
eas login
```

### Lỗi: "No build profile found"
```bash
eas build:configure
```

### Build bị lỗi signing
- Đảm bảo đã có Apple ID hoặc Apple Developer account
- Kiểm tra bundle identifier trong app.json

### Không download được .ipa
- Kiểm tra iPhone và Mac cùng network
- Thử mở link trên Safari (không phải Chrome)
- Kiểm tra Settings → General → VPN & Device Management

---

## Script nhanh:

```bash
# Đăng nhập
eas login

# Build preview
eas build --platform ios --profile preview

# Kiểm tra status
eas build:list
```
