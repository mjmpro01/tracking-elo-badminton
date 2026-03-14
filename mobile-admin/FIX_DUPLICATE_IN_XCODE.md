# Sửa lỗi Duplicate Symbol trong Xcode

## Cách sửa trong Xcode:

### Bước 1: Xóa libEXImageLoader.a khỏi Link Binary With Libraries
1. Chọn project **mobileadmin** → target **mobileadmin**
2. Tab **Build Phases** → **Link Binary With Libraries**
3. Tìm và xóa `libEXImageLoader.a` (nếu còn)

### Bước 2: Thêm Linker Flag để bỏ qua duplicate
1. Chọn project **mobileadmin** → target **mobileadmin**
2. Tab **Build Settings**
3. Tìm **"Other Linker Flags"** (gõ "linker" vào search box)
4. Nhấn **+** để thêm flag mới
5. Thêm: `-Wl,-dead_strip`

### Bước 3: Hoặc exclude EXImageLoader từ linking
1. Vẫn trong **Build Settings**
2. Tìm **"Other Linker Flags"**
3. Thêm: `-Wl,-weak-lEXImageLoader` (weak link)

### Bước 4: Clean và Build
1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Nếu vẫn lỗi:

Thử cách này trong Xcode:
1. **Build Settings** → **Other Linker Flags**
2. Thêm: `$(inherited) -Wl,-dead_strip -Wl,-no_warn_duplicate_libraries`

Hoặc:
1. Vào **Build Phases** → **Link Binary With Libraries**
2. Đảm bảo `libEXImageLoader.a` KHÔNG có trong danh sách
3. Nếu có, xóa nó
