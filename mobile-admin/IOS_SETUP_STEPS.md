# Các bước Build iOS cho iPhone Thật

## Bước 1: Cấu hình Apple ID trong Xcode

1. **Mở Xcode** (nếu chưa mở):
   ```bash
   open /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin/ios/mobileadmin.xcworkspace
   ```

2. **Thêm Apple ID:**
   - Vào **Xcode** → **Settings** (hoặc **Preferences** - Cmd + ,)
   - Chọn tab **Accounts**
   - Nhấn nút **+** (dưới cùng bên trái)
   - Chọn **Apple ID**
   - Nhập Apple ID và mật khẩu của bạn
   - Nhấn **Sign In**

3. **Chọn Team:**
   - Sau khi đăng nhập, bạn sẽ thấy team của mình (có thể là "Personal Team" - miễn phí)
   - Ghi nhớ tên team này

## Bước 2: Cấu hình Signing trong Xcode

1. **Chọn project:**
   - Ở sidebar bên trái, chọn **mobileadmin** (icon màu xanh ở trên cùng)

2. **Chọn Target:**
   - Chọn target **mobileadmin** (dưới TARGETS)

3. **Cấu hình Signing:**
   - Chọn tab **Signing & Capabilities**
   - ✅ Đánh dấu **"Automatically manage signing"**
   - Chọn **Team** từ dropdown (team bạn vừa thêm ở Bước 1)
   - Xcode sẽ tự động tạo **Provisioning Profile** và **Signing Certificate**

4. **Kiểm tra Bundle Identifier:**
   - Đảm bảo **Bundle Identifier** là: `com.mobileadmin.app`
   - Nếu bị trùng, thêm `.dev` hoặc số vào cuối (ví dụ: `com.mobileadmin.app.dev`)

## Bước 3: Chọn iPhone làm Target

1. **Chọn device:**
   - Ở thanh toolbar phía trên, bên cạnh nút Play (▶️)
   - Click vào dropdown hiện tại (có thể đang hiện "Any iOS Device" hoặc Simulator)
   - Chọn **"Poem"** (iPhone của bạn)

## Bước 4: Build và Cài App

### Cách 1: Dùng Xcode (Dễ nhất)

1. Nhấn nút **Play** (▶️) hoặc nhấn **Cmd + R**
2. Xcode sẽ tự động:
   - Build project
   - Cài app vào iPhone
   - Chạy app

### Cách 2: Dùng Terminal

```bash
cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin
npx expo run:ios --device
```

## Bước 5: Trust Developer trên iPhone (Lần đầu cài)

Sau khi app được cài vào iPhone:

1. **Mở iPhone** → **Settings** → **General**
2. Cuộn xuống → **VPN & Device Management** (hoặc **Device Management**)
3. Tìm section **"Developer App"** hoặc tên Apple ID của bạn
4. Nhấn vào → Nhấn **Trust "Your Name"**
5. Nhấn **Trust** lần nữa để xác nhận

## Bước 6: Chạy App

1. Trên iPhone, tìm icon app **"mobile-admin"**
2. Nhấn vào để mở
3. Nếu bị chặn, vào **Settings** → **General** → **VPN & Device Management** → Trust app

---

## Troubleshooting

### Lỗi "No code signing certificates"
- Đảm bảo đã thêm Apple ID trong Xcode Settings → Accounts
- Đảm bảo đã chọn Team trong Signing & Capabilities
- Thử **Product** → **Clean Build Folder** (Shift + Cmd + K)

### Lỗi "Bundle identifier is already in use"
- Đổi Bundle Identifier trong Xcode (thêm `.dev` hoặc số)

### Lỗi "Unable to install"
- Xóa app cũ nếu đã cài trước đó
- Đảm bảo đã trust developer trên iPhone
- Kiểm tra iPhone đã unlock và trust máy tính

### Lỗi "Device not found"
- Đảm bảo iPhone đã unlock
- Kiểm tra cáp USB
- Trust máy tính trên iPhone (Settings → General → About → Trust This Computer)
