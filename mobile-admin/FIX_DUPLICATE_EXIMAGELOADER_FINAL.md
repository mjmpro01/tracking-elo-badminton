# Sửa lỗi Duplicate Symbol EXImageLoader (Đã Fix)

## Vấn đề

Lỗi duplicate symbol `EXImageLoader` xảy ra vì:
- `EXImageLoader` được include trong cả `libEXImageLoader.a` (standalone pod)
- Và trong `ExpoModulesCore` (đã có sẵn)

Khi link cả hai → duplicate symbol error.

## Giải pháp đã áp dụng

Đã thêm `post_install` hook vào `Podfile` để:
1. **Loại bỏ `-l"EXImageLoader"` khỏi `OTHER_LDFLAGS`** trong build settings
2. **Loại bỏ `-l"EXImageLoader"` khỏi xcconfig files** được generate bởi CocoaPods
3. **Set C++ standard** thành `c++17` để fix const correctness issues

## Đã thực hiện

✅ Chạy `pod install` thành công
✅ `-l"EXImageLoader"` đã được loại bỏ khỏi `OTHER_LDFLAGS`
✅ C++ standard đã được set thành `c++17`

## Bước tiếp theo: Build từ Xcode

1. **Mở Xcode:**
   ```bash
   open ios/mobileadmin.xcworkspace
   ```

2. **Clean Build Folder:**
   - **Product** → **Clean Build Folder** (Shift + Cmd + K)

3. **Chọn iPhone làm target device**

4. **Build và Run:**
   - **Product** → **Build** (Cmd + B)
   - **Product** → **Run** (Cmd + R)

## Lưu ý

- `EXImageLoader` vẫn còn trong `HEADER_SEARCH_PATHS` và `LIBRARY_SEARCH_PATHS` → **ĐÂY LÀ BÌNH THƯỜNG**
- Chỉ cần loại bỏ khỏi `OTHER_LDFLAGS` (linker flags) là đủ
- `EXImageLoader` sẽ được link qua `ExpoModulesCore` thay vì standalone library

## Nếu vẫn còn lỗi

1. Xóa DerivedData:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/mobileadmin-*
   ```

2. Rebuild lại:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. Build từ Xcode (không dùng `expo run:ios`)
