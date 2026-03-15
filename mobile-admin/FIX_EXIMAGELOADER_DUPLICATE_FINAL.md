# Fix EXImageLoader Duplicate Symbols - Hướng dẫn cuối cùng

## Vấn đề:
- `libEXImageLoader.a` và `libExpoModulesCore.a` đều chứa EXImageLoader
- Gây duplicate symbols khi link
- Lỗi: "duplicate symbol '_OBJC_METACLASS_$_EXImageLoader'"

## Giải pháp đã áp dụng:

### 1. ✅ Đã loại bỏ EXImageLoader khỏi Podfile linker flags
### 2. ✅ Đã loại bỏ EXImageLoader khỏi xcconfig files  
### 3. ✅ Đã loại bỏ EXImageLoader khỏi project.pbxproj
### 4. ✅ Đã thêm `-Wl,-dead_strip` vào OTHER_LDFLAGS

## Bước cuối cùng - Fix trong Xcode:

### Cách 1: Loại bỏ EXImageLoader khỏi Link Binary With Libraries (Khuyến nghị)

1. **Mở Xcode:**
   ```bash
   open ios/mobileadmin.xcworkspace
   ```

2. **Chọn project và target:**
   - Chọn project **mobileadmin** (icon màu xanh ở sidebar trái)
   - Chọn target **mobileadmin** (dưới TARGETS)

3. **Vào Build Phases:**
   - Tab **Build Phases** (ở trên cùng)
   - Mở rộng **Link Binary With Libraries**

4. **Xóa EXImageLoader:**
   - Tìm `libEXImageLoader.a` trong danh sách
   - **Nếu có**, chọn nó và nhấn nút **-** (dấu trừ) để xóa

5. **Clean và Build:**
   - **Product** → **Clean Build Folder** (Shift + Cmd + K)
   - **Product** → **Build** (Cmd + B)

### Cách 2: Thêm linker flag để bỏ qua duplicate (Nếu Cách 1 không đủ)

1. **Vào Build Settings:**
   - Tab **Build Settings**
   - Tìm **"Other Linker Flags"** (gõ "linker" vào search box)

2. **Thêm flag:**
   - Nhấn **+** để thêm flag mới
   - Thêm: `-Wl,-no_warn_duplicate_libraries`
   - Hoặc: `-Wl,-allow-multiple-definition`

3. **Clean và Build lại**

### Cách 3: Exclude EXImageLoader target (Nếu vẫn lỗi)

1. **Trong Xcode:**
   - Chọn project **mobileadmin**
   - Tìm target **EXImageLoader** trong danh sách targets
   - **Nếu có**, chọn nó và nhấn **Delete** (hoặc uncheck để không build)

2. **Hoặc trong Build Settings:**
   - Chọn target **EXImageLoader**
   - **Build Settings** → tìm **"Excluded Architectures"**
   - Thêm: `arm64` cho tất cả SDKs

## Kiểm tra sau khi fix:

```bash
# Kiểm tra xem còn EXImageLoader trong linker command không
cd ios
xcodebuild -workspace mobileadmin.xcworkspace -scheme mobileadmin -showBuildSettings | grep EXImageLoader
```

Nếu không có output → Đã fix thành công!

## Lưu ý:

- EXImageLoader vẫn cần thiết cho expo-image, nhưng nó đã có trong ExpoModulesCore
- Chỉ cần loại bỏ standalone library, không cần loại bỏ hoàn toàn
- Sau khi fix, expo-image vẫn hoạt động bình thường qua ExpoModulesCore
