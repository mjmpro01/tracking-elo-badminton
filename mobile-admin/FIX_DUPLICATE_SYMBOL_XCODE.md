# Sửa lỗi "2 duplicate symbols" trong Xcode

## Cách 1: Sửa trực tiếp trong Xcode (Nhanh nhất)

### Bước 1: Mở Xcode
```bash
open ios/mobileadmin.xcworkspace
```

### Bước 2: Xóa libEXImageLoader.a khỏi Link Binary With Libraries

1. Chọn project **mobileadmin** (icon màu xanh ở sidebar trái)
2. Chọn target **mobileadmin** (dưới TARGETS)
3. Tab **Build Phases** (ở trên cùng)
4. Mở rộng **Link Binary With Libraries**
5. Tìm `libEXImageLoader.a` trong danh sách
6. **Nếu có**, chọn nó và nhấn nút **-** (dấu trừ) để xóa

### Bước 3: Thêm Linker Flag để bỏ qua duplicate

1. Vẫn trong target **mobileadmin**
2. Tab **Build Settings** (ở trên cùng)
3. Tìm **"Other Linker Flags"** (gõ "linker" vào search box)
4. Nhấn vào dòng **"Other Linker Flags"** để expand
5. Nhấn **+** (dấu cộng) để thêm flag mới
6. Thêm: `-Wl,-dead_strip`

### Bước 4: Clean và Build

1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Cách 2: Sửa qua Podfile (Tự động)

Đã thêm `post_install` hook vào Podfile để tự động loại bỏ `-l"EXImageLoader"` khỏi linker flags.

### Chạy lại pod install:
```bash
cd mobile-admin/ios
pod install
cd ..
```

Sau đó build từ Xcode:
1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Cách 3: Xóa DerivedData và rebuild

Nếu vẫn lỗi, thử xóa DerivedData:

```bash
# Xóa DerivedData
rm -rf ~/Library/Developer/Xcode/DerivedData/mobileadmin-*

# Rebuild pods
cd mobile-admin/ios
pod install
cd ..

# Mở Xcode và build lại
open ios/mobileadmin.xcworkspace
```

Trong Xcode:
1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Giải thích

- `EXImageLoader` được include trong cả `libEXImageLoader.a` (standalone) và `ExpoModulesCore`
- Khi link cả hai → duplicate symbol error
- Giải pháp: Chỉ link qua `ExpoModulesCore`, không link `libEXImageLoader.a` riêng
- Flag `-Wl,-dead_strip` giúp linker tự động loại bỏ duplicate symbols
