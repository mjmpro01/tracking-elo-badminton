# Build iOS App cho iPhone thật

## Cách 1: Build Local với Xcode (Nhanh nhất - Khuyến nghị)

### Bước 1: Kết nối iPhone vào Mac
1. Dùng cáp USB kết nối iPhone vào Mac
2. Trên iPhone: **Trust This Computer** (nếu được hỏi)
3. Mở **Settings** → **Privacy & Security** → **Developer Mode** → **Enable**

### Bước 2: Prebuild (tạo native code)
```bash
cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin
npx expo prebuild --clean
```

### Bước 3: Mở Xcode
```bash
open ios/mobileadmin.xcworkspace
```

### Bước 4: Cấu hình Signing trong Xcode

1. **Chọn project "mobileadmin"** (icon màu xanh) → **target "mobileadmin"**
2. Tab **"Signing & Capabilities"**
3. Chọn **"Automatically manage signing"**
4. Chọn **Team** (Apple ID của bạn)
   - Nếu chưa có, nhấn **"Add Account..."** và đăng nhập Apple ID
5. Xcode sẽ tự động tạo provisioning profile

### Bước 5: Chọn iPhone làm target device

1. Ở thanh toolbar trên cùng, click vào device selector (bên cạnh nút Run)
2. Chọn **iPhone của bạn** (sẽ hiện tên device, ví dụ: "Poem" hoặc tên iPhone của bạn)

### Bước 6: Build và Install

1. **Product** → **Run** (hoặc nhấn `Cmd + R`)
2. Xcode sẽ:
   - Build app
   - Install lên iPhone
   - Tự động mở app trên iPhone

### Bước 7: Trust Developer trên iPhone (lần đầu)

Nếu app không mở được:
1. Trên iPhone: **Settings** → **General** → **VPN & Device Management**
2. Tìm **Developer App** (tên Apple ID của bạn)
3. Nhấn **Trust** → **Trust**

---

## Cách 2: Build với EAS Build (Cloud - Chậm hơn nhưng không cần Mac)

### Bước 1: Đăng nhập Expo
```bash
eas login
```

### Bước 2: Build preview (cho device thật)
```bash
eas build --platform ios --profile preview
```

### Bước 3: Cài đặt lên iPhone

Sau khi build xong:
1. EAS sẽ cung cấp QR code hoặc link download
2. Mở link trên iPhone (Safari)
3. Download file .ipa
4. Cài đặt (có thể cần trust developer như Bước 7 ở trên)

---

## Troubleshooting

### Lỗi: "No devices found"
- Đảm bảo iPhone đã được kết nối qua USB
- Kiểm tra iPhone đã trust computer chưa
- Thử disconnect và reconnect

### Lỗi: "Signing requires a development team"
- Vào Xcode → Settings → Accounts
- Thêm Apple ID của bạn
- Chọn Team trong Signing & Capabilities

### Lỗi: "Developer Mode is not enabled"
- Settings → Privacy & Security → Developer Mode → Enable
- Restart iPhone

### App không mở được sau khi install
- Settings → General → VPN & Device Management
- Trust developer certificate

---

## Lưu ý:

### Với Apple ID miễn phí:
- ✅ App chạy được trên device thật
- ⚠️ App chỉ chạy được **7 ngày**
- ⚠️ Sau 7 ngày cần rebuild lại
- ⚠️ Tối đa 3 apps cùng lúc

### Với Apple Developer account ($99/năm):
- ✅ App chạy được **1 năm**
- ✅ Có thể distribute cho nhiều devices
- ✅ Có thể publish lên App Store

---

## Script nhanh:

```bash
# Build và install lên iPhone
cd mobile-admin
npx expo prebuild --clean
open ios/mobileadmin.xcworkspace
# Sau đó trong Xcode: Chọn iPhone → Run (Cmd + R)
```
