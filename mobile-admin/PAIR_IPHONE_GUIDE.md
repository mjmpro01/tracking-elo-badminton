# Hướng dẫn Pair iPhone với Xcode

## Lỗi: "Poem is not available because it is unpaired"

Đây là lỗi phổ biến khi iPhone chưa được ghép nối (pair) với Xcode.

## Các bước Pair iPhone:

### Bước 1: Mở Devices Window trong Xcode

1. Trong Xcode, vào menu: **Window** → **Devices and Simulators**
   - Hoặc nhấn phím tắt: **Shift + Cmd + 2**

2. Cửa sổ **Devices and Simulators** sẽ mở ra

### Bước 2: Pair với iPhone

1. Ở sidebar bên trái, bạn sẽ thấy **"Poem"** (iPhone của bạn)
2. Nếu thấy icon **🔗** (link) hoặc thông báo "Unpaired", click vào **"Poem"**
3. Xcode sẽ bắt đầu quá trình pair

### Bước 3: Trust trên iPhone

1. Trên màn hình iPhone, sẽ xuất hiện popup: **"Trust This Computer?"**
2. Nhấn **"Trust"**
3. Nhập passcode của iPhone nếu được yêu cầu

### Bước 4: Kiểm tra Pair thành công

1. Trong Xcode Devices Window, **"Poem"** sẽ hiển thị:
   - ✅ Icon màu xanh (đã pair)
   - Thông tin device (iOS version, UDID, etc.)
   - Không còn thông báo "Unpaired"

### Bước 5: Build lại

1. Quay lại Xcode project
2. Chọn **"Poem"** làm target (bên cạnh nút Play)
3. Nhấn **Play** (▶️) hoặc **Cmd + R**

---

## Troubleshooting

### Nếu không thấy popup "Trust This Computer" trên iPhone:

1. **Rút và cắm lại dây USB**
2. **Unlock iPhone** (mở khóa màn hình)
3. **Kiểm tra cáp USB** (thử cáp khác nếu có)
4. **Kiểm tra iPhone Settings:**
   - Settings → General → About
   - Nếu thấy "Trust This Computer", nhấn vào và Trust

### Nếu vẫn không pair được:

1. **Restart iPhone**
2. **Restart Xcode**
3. **Thử cáp USB khác**
4. **Kiểm tra iPhone có bật Developer Mode:**
   - Settings → Privacy & Security → Developer Mode
   - Bật Developer Mode nếu chưa bật (có thể cần restart iPhone)

### Nếu iPhone yêu cầu Developer Mode:

1. Settings → Privacy & Security → Developer Mode
2. Bật Developer Mode
3. iPhone sẽ yêu cầu restart
4. Sau khi restart, vào lại Settings → Privacy & Security → Developer Mode
5. Xác nhận bật Developer Mode

---

## Lưu ý:

- **Lần đầu pair** có thể mất 1-2 phút
- **Đảm bảo iPhone đã unlock** khi pair
- **Cáp USB phải kết nối tốt** (không lỏng)
- **Trust máy tính** trên iPhone nếu được hỏi
