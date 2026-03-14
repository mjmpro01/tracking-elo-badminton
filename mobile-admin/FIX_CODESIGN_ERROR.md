# Sửa lỗi Code Signing "errSecInternalComponent"

Lỗi này xảy ra khi Xcode không thể ký (sign) file dylib do vấn đề với Keychain hoặc Certificate.

## Giải pháp 1: Unlock Keychain

1. Mở **Keychain Access** (Ứng dụng → Tiện ích → Keychain Access)
2. Click chuột phải vào **"login"** keychain ở sidebar bên trái
3. Chọn **"Unlock Keychain"**
4. Nhập mật khẩu Mac của bạn
5. Đảm bảo **"Show keychain status in menu bar"** được bật (Preferences → General)
6. Thử build lại trong Xcode

## Giải pháp 2: Xóa và tạo lại Certificate

1. Trong Xcode:
   - Chọn project **mobileadmin** → target **mobileadmin**
   - Tab **Signing & Capabilities**
   - Bỏ chọn **"Automatically manage signing"**
   - Chọn lại **"Automatically manage signing"**
   - Chọn lại **Team** (Apple ID của bạn)

2. Hoặc xóa certificate cũ:
   - Mở **Keychain Access**
   - Tìm certificate **"Apple Development: duyminh2032000@gmail.com"**
   - Xóa certificate đó
   - Trong Xcode, chọn lại **Team** → Xcode sẽ tự động tạo certificate mới

## Giải pháp 3: Clean và Build lại

1. Trong Xcode:
   - **Product** → **Clean Build Folder** (Shift + Cmd + K)
   - Đóng Xcode
   - Xóa DerivedData:
     ```bash
     rm -rf ~/Library/Developer/Xcode/DerivedData/mobileadmin-*
     ```
   - Mở lại Xcode và build

## Giải pháp 4: Disable Code Signing cho dylib (tạm thời)

Nếu các cách trên không được, có thể tạm thời disable code signing cho dylib:

1. Trong Xcode:
   - Chọn project **mobileadmin** → target **mobileadmin**
   - Tab **Build Settings**
   - Tìm **"Code Signing"**
   - Tìm **"Code Signing Entitlements"**
   - Để trống hoặc xóa giá trị

**Lưu ý**: Cách này chỉ dùng cho development, không dùng cho production build.

## Giải pháp 5: Kiểm tra Provisioning Profile

1. Trong Xcode:
   - Chọn project **mobileadmin** → target **mobileadmin**
   - Tab **Signing & Capabilities**
   - Click vào **"i"** icon bên cạnh Provisioning Profile
   - Xem thông tin profile
   - Nếu profile bị lỗi, click **"Download Manual Profiles"**

## Giải pháp 6: Reset Keychain

**CẢNH BÁO**: Chỉ làm nếu các cách trên không được!

1. Mở **Keychain Access**
2. Chọn **"login"** keychain
3. **File** → **Delete Keychain "login"**
4. Tạo keychain mới với tên "login"
5. Restart Mac
6. Mở Xcode và build lại
