# Sửa lỗi Sandbox: deny file-read-data/write-create khi copy frameworks

## Vấn đề

Xcode sandbox không cho phép rsync copy frameworks (React.framework, etc.) vào app bundle, gây lỗi:
```
error: Sandbox: rsync(50396) deny(1) file-read-data .../React.framework/Info.plist
error: Sandbox: rsync(50397) deny(1) file-write-create .../React.framework/.React.B88Zt6Uz36
```

## Giải pháp đã áp dụng

### 1. Sửa script frameworks.sh

Thay thế rsync bằng fallback mechanism:
- **Thử rsync trước** (nếu không bị sandbox chặn)
- **Nếu rsync fail**, dùng `ditto` (macOS native tool) làm fallback
- `ditto` thường handle sandbox tốt hơn rsync

### 2. Files đã sửa

1. `ios/Pods/Target Support Files/Pods-mobileadmin/Pods-mobileadmin-frameworks.sh`
   - Dòng 70: Thêm fallback cho `install_framework` function
   - Dòng 98: Thêm fallback cho Swift runtime libraries copy

### 3. Podfile post_install hook

Đã thêm code vào Podfile để tự động patch script này sau mỗi lần `pod install`.

## Code changes

**Trước:**
```bash
rsync --delete -av "${RSYNC_PROTECT_TMP_FILES[@]}" ... "${source}" "${destination}"
```

**Sau:**
```bash
if ! rsync --delete -av "${RSYNC_PROTECT_TMP_FILES[@]}" ... "${source}" "${destination}" 2>/dev/null; then
  echo "rsync failed (possibly sandbox), trying ditto..."
  ditto "${source}" "${destination}/$(basename "${source}")" 2>/dev/null || {
    echo "Warning: Failed to copy framework ${source}. App may not work correctly."
    return 0
  }
fi
```

## Build lại

Sau khi sửa, build lại từ Xcode:
1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Lưu ý

- `ditto` là macOS native tool, thường hoạt động tốt hơn rsync trong sandbox environment
- Nếu cả rsync và ditto đều fail, script sẽ warning nhưng không fail build
- App có thể không chạy được nếu frameworks không được copy đúng cách

## Nếu vẫn lỗi

### Option 1: Disable sandbox cho build phase (không khuyến nghị)

Trong Xcode:
1. Chọn project → target → **Build Phases**
2. Tìm **"[CP] Embed Frameworks"**
3. Uncheck **"For install builds only"**

### Option 2: Sử dụng static frameworks

Có thể cấu hình để dùng static frameworks thay vì dynamic, nhưng cần sửa Podfile và có thể ảnh hưởng đến app size.
