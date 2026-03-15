# Sửa lỗi Sandbox: deny file-write-create ip.txt

## Vấn đề

Xcode sandbox không cho phép script `react-native-xcode.sh` ghi file `ip.txt` vào thư mục build, gây lỗi:
```
error: Sandbox: bash(23172) deny(1) file-write-create .../mobileadmin.app/ip.txt
```

## Giải pháp đã áp dụng

Đã sửa script `react-native-xcode.sh` để:
- **Không fail build** nếu không ghi được file `ip.txt`
- Sử dụng `2>/dev/null || true` để bỏ qua lỗi sandbox

## File đã sửa

`node_modules/react-native/scripts/react-native-xcode.sh` - dòng 27

**Trước:**
```bash
echo "$IP" > "$DEST/ip.txt"
```

**Sau:**
```bash
echo "$IP" > "$DEST/ip.txt" 2>/dev/null || true
```

## Lưu ý

- File `ip.txt` được dùng để Metro bundler biết địa chỉ IP của máy Mac
- Nếu không ghi được file, app vẫn build thành công
- Bạn có thể tự nhập IP của Mac vào app khi cần kết nối Metro bundler

## Cách lấy IP của Mac (nếu cần)

```bash
# Lấy IP của Mac
ipconfig getifaddr en0

# Hoặc
ifconfig | grep 'inet ' | grep -v ' 127.' | grep -v ' 169.254.' | cut -d\   -f2 | awk 'NR==1{print $1}'
```

## Build lại

Sau khi sửa, build lại từ Xcode:
1. **Product** → **Clean Build Folder** (Shift + Cmd + K)
2. **Product** → **Build** (Cmd + B)

---

## Giải pháp thay thế (nếu vẫn lỗi)

### Option 1: Skip tạo file ip.txt

Thêm vào Xcode Build Settings → **User-Defined Settings**:
- Key: `SKIP_BUNDLING_METRO_IP`
- Value: `1`

### Option 2: Sử dụng environment variable

Thay vì file, có thể dùng environment variable (cần sửa code app).
