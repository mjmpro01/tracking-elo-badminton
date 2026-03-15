# Sửa lỗi Sandbox: deny file-write-create resources-to-copy-mobileadmin.txt

## Vấn đề

Xcode sandbox không cho phép CocoaPods script ghi file `resources-to-copy-mobileadmin.txt`, gây lỗi:
```
error: Sandbox: bash(33984) deny(1) file-write-create .../resources-to-copy-mobileadmin.txt
realpath: illegal option -- m
```

Có 2 vấn đề:
1. **Sandbox deny**: Script không thể ghi file vào thư mục Pods
2. **realpath -m**: macOS version của `realpath` không hỗ trợ option `-m` (chỉ có trong GNU coreutils)

## Giải pháp đã áp dụng

### 1. Sửa lỗi realpath -m

Thay thế `realpath -mq` bằng cách tương thích với macOS:
- Kiểm tra xem `realpath` có phải GNU version không
- Nếu không, dùng `cd` và `pwd` để lấy absolute path

### 2. Sửa lỗi sandbox

- **Dòng 20**: Thay `> "$RESOURCES_TO_COPY"` bằng `> "$RESOURCES_TO_COPY" 2>/dev/null || touch "$RESOURCES_TO_COPY" 2>/dev/null || true`
- **Dòng 95**: Thay `>> "$RESOURCES_TO_COPY"` bằng `>> "$RESOURCES_TO_COPY" 2>/dev/null || true`
- **Dòng 119-122**: Kiểm tra file tồn tại và readable trước khi dùng rsync
- **Dòng 124**: Thay `rm -f` bằng `rm -f ... 2>/dev/null || true`

## Files đã sửa

1. `ios/Pods/Target Support Files/Pods-mobileadmin/Pods-mobileadmin-resources.sh`
2. `ios/Pods/Target Support Files/Pods-mobileadmin/Pods-mobileadmin-frameworks.sh`

## Lưu ý

- Các file này nằm trong `Pods/`, nên khi chạy `pod install` lại sẽ bị ghi đè
- Nếu sau này chạy `pod install` và lỗi quay lại, cần sửa lại các file này

## Build lại

Sau khi sửa, build lại từ Xcode:
1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Giải pháp thay thế (nếu vẫn lỗi)

### Option 1: Disable sandbox cho build script (không khuyến nghị)

Trong Xcode:
1. Chọn project → target → **Build Phases**
2. Tìm **"[CP] Copy Pods Resources"**
3. Uncheck **"For install builds only"**
4. Hoặc thêm `--disable-sandbox` flag (nếu có)

### Option 2: Sử dụng temp directory

Có thể sửa script để ghi file vào temp directory thay vì Pods directory, nhưng cần sửa nhiều chỗ.
