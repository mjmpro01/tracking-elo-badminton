# Cách lấy Apple ID để build iOS app

## Apple ID là gì?

Apple ID là tài khoản của Apple, dùng để:
- Đăng nhập vào các dịch vụ của Apple (iCloud, App Store, etc.)
- Build và sign iOS apps
- Publish apps lên App Store

---

## Cách 1: Sử dụng Apple ID hiện có (Nếu đã có)

### Nếu bạn đã có iPhone:
- Apple ID chính là **email bạn dùng để đăng nhập iCloud**
- Hoặc email bạn dùng để mua apps trên App Store
- Settings → [Tên của bạn] → xem email Apple ID

### Kiểm tra Apple ID hiện có:
1. Trên iPhone: **Settings** → [Tên của bạn] ở đầu trang
2. Xem **Email** - đó chính là Apple ID của bạn

---

## Cách 2: Tạo Apple ID mới (Nếu chưa có)

### Bước 1: Truy cập trang tạo Apple ID

**Trên Mac/PC:**
- Truy cập: https://appleid.apple.com
- Hoặc: https://appleid.apple.com/account

**Trên iPhone:**
- Settings → Sign in to your iPhone → Don't have an Apple ID? → Create Apple ID

### Bước 2: Điền thông tin

1. **Personal Information:**
   - First Name (Tên)
   - Last Name (Họ)
   - Email (email để làm Apple ID)
   - Password (mật khẩu)
   - Country/Region (Quốc gia)

2. **Security:**
   - Security Questions (câu hỏi bảo mật)
   - Date of Birth (ngày sinh)

3. **Verification:**
   - Xác minh email (check email và nhập code)
   - Xác minh phone number (nếu cần)

### Bước 3: Hoàn tất

- Đọc và chấp nhận Terms and Conditions
- Xác minh email
- Apple ID đã sẵn sàng!

---

## Cách 3: Tạo Apple ID nhanh trên iPhone

1. **Settings** → **Sign in to your iPhone**
2. Chọn **"Don't have an Apple ID?"**
3. Chọn **"Create Apple ID"**
4. Điền thông tin theo hướng dẫn
5. Xác minh email và phone number

---

## Lưu ý quan trọng:

### Apple ID miễn phí:
- ✅ **Miễn phí** - không cần trả tiền
- ✅ Có thể build và cài app lên iPhone
- ⚠️ App chỉ chạy được **7 ngày**
- ⚠️ Sau 7 ngày cần rebuild lại
- ⚠️ Tối đa **3 apps** cùng lúc trên device

### Apple Developer account ($99/năm):
- 💰 **$99 USD/năm** (khoảng 2.4 triệu VNĐ)
- ✅ App chạy được **1 năm**
- ✅ Có thể distribute cho nhiều devices
- ✅ Có thể publish lên App Store
- ✅ Không giới hạn số lượng apps

---

## Sử dụng Apple ID để build:

### Trong Xcode (Build local):

1. Mở Xcode
2. **Xcode** → **Settings** (hoặc **Preferences**)
3. Tab **"Accounts"**
4. Nhấn **"+"** → **"Apple ID"**
5. Nhập Apple ID và password
6. Xcode sẽ tự động tạo certificates

### Với EAS Build:

Apple ID sẽ được sử dụng tự động khi build trên cloud của Expo.

---

## Kiểm tra Apple ID đã có:

### Trên iPhone:
- Settings → [Tên của bạn] → xem email

### Trên Mac:
- System Settings → Apple ID (hoặc iCloud)
- Xem email đăng nhập

### Trên web:
- Truy cập: https://appleid.apple.com
- Đăng nhập để xem thông tin

---

## Troubleshooting:

### Quên mật khẩu Apple ID:
- Truy cập: https://iforgot.apple.com
- Reset password bằng email hoặc phone number

### Apple ID bị khóa:
- Truy cập: https://iforgot.apple.com
- Unlock account

### Cần verify Apple ID:
- Check email để xác minh
- Hoặc verify qua phone number

---

## Tóm tắt:

1. **Nếu đã có iPhone:** Apple ID = email đăng nhập iCloud
2. **Nếu chưa có:** Tạo mới tại https://appleid.apple.com
3. **Miễn phí:** Có thể build app, nhưng chỉ chạy 7 ngày
4. **$99/năm:** App chạy 1 năm, có thể publish App Store
