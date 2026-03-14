# Sửa lỗi "library 'EXImageLoader' not found"

## Vấn đề:
- Đã xóa duplicate symbol thành công
- Nhưng bây giờ linker không tìm thấy library EXImageLoader

## Giải pháp:

### Cách 1: Thêm lại libEXImageLoader.a với Optional (Weak Link)

1. Trong Xcode, chọn project **mobileadmin** → target **mobileadmin**
2. Tab **Build Phases** → **Link Binary With Libraries**
3. Nhấn nút **+** (dấu cộng)
4. Tìm và thêm `libEXImageLoader.a`
5. Sau khi thêm, click vào `libEXImageLoader.a` trong danh sách
6. Ở cột **Status**, đổi từ **"Required"** thành **"Optional"** (weak link)

### Cách 2: Thêm vào Other Linker Flags

1. Tab **Build Settings**
2. Tìm **"Other Linker Flags"**
3. Thêm: `-weak_framework EXImageLoader` hoặc `-weak-lEXImageLoader`

### Cách 3: Clean và Build lại

1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Giải thích:

- **Weak link** cho phép app chạy ngay cả khi library không tồn tại
- Vì `ExpoModulesCore` đã có `EXImageLoader`, nên weak link sẽ dùng version từ ExpoModulesCore
- Điều này tránh duplicate symbol nhưng vẫn satisfy dependency của expo-image
