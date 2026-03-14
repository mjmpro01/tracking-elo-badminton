# Bật Developer Mode trên iPhone

## Lỗi hiện tại:
```
error: Developer Mode disabled
To use Poem for development, enable Developer Mode in Settings → Privacy & Security.
```

## Các bước bật Developer Mode:

### Bước 1: Mở Settings trên iPhone

1. Mở **Settings** (Cài đặt) trên iPhone

### Bước 2: Vào Privacy & Security

1. Cuộn xuống tìm **Privacy & Security** (Quyền riêng tư & Bảo mật)
2. Nhấn vào

### Bước 3: Bật Developer Mode

1. Cuộn xuống tìm **Developer Mode** (Chế độ nhà phát triển)
2. Nhấn vào
3. Bật toggle **Developer Mode** (ON)
4. iPhone sẽ yêu cầu **Restart** (Khởi động lại)

### Bước 4: Restart iPhone

1. Nhấn **Restart** khi được hỏi
2. Đợi iPhone khởi động lại

### Bước 5: Xác nhận Developer Mode

1. Sau khi restart, mở lại **Settings** → **Privacy & Security** → **Developer Mode**
2. Xác nhận bật Developer Mode (có thể cần nhập passcode)

### Bước 6: Build lại

1. Quay lại Xcode hoặc terminal
2. Build lại app:
   ```bash
   cd mobile-admin
   npx expo run:ios --device
   ```

---

## Lưu ý:

- **Developer Mode** chỉ xuất hiện sau khi bạn đã cắm iPhone vào Mac và Xcode đã nhận diện device
- **Lần đầu bật** sẽ yêu cầu restart iPhone
- **Cần nhập passcode** để xác nhận
- **Developer Mode** cần được bật để cài app development lên iPhone

---

## Nếu không thấy Developer Mode:

1. Đảm bảo iPhone đã được **pair** với Xcode
2. Thử **rút và cắm lại** dây USB
3. **Unlock iPhone** (mở khóa màn hình)
4. **Trust máy tính** trên iPhone nếu được hỏi
