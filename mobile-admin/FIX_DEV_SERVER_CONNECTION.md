# Fix "Could not connect to development server"

## Vấn đề:
- App không kết nối được đến Metro bundler/Expo development server
- Lỗi: "Could not connect to development server" hoặc "No script URL provided"

## Đã fix:
✅ Metro bundler đã được khởi động lại trên port 8081
✅ Server đang chạy tại: http://192.168.1.146:8081
✅ Status: packager-status:running

## Cách fix trong app:

### Cách 1: Reload JS trong Simulator/Device

1. **Trong iOS Simulator:**
   - Nhấn `Cmd + R` để reload
   - Hoặc: Device → Shake Gesture (Cmd + Ctrl + Z)
   - Chọn "Reload JS"

2. **Trên iPhone thật:**
   - Shake device (lắc điện thoại)
   - Chọn "Reload JS" từ menu

3. **Hoặc nhấn nút "Reload JS"** trong error screen

### Cách 2: Kiểm tra Network

1. **Đảm bảo iPhone/Simulator và Mac cùng network:**
   - iPhone: Settings → WiFi → Kiểm tra IP (phải cùng subnet với 192.168.1.x)
   - Simulator: Tự động dùng network của Mac

2. **Kiểm tra firewall:**
   ```bash
   # Cho phép Node.js qua firewall
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
   ```

### Cách 3: Start lại development server

```bash
cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin
npx expo start --lan
```

Hoặc chạy script:
```bash
./start_dev_server.sh
```

### Cách 4: Sử dụng Tunnel mode (nếu LAN không hoạt động)

```bash
npx expo start --tunnel
```

## Kiểm tra server:

```bash
# Kiểm tra server có chạy không
curl http://192.168.1.146:8081/status

# Kiểm tra từ browser
open http://192.168.1.146:8081
```

## Troubleshooting:

### Nếu vẫn không kết nối được:

1. **Kiểm tra IP address:**
   ```bash
   ifconfig | grep "inet "
   ```
   Đảm bảo IP là 192.168.1.146

2. **Kiểm tra port 8081:**
   ```bash
   lsof -i :8081
   ```

3. **Restart Metro bundler:**
   ```bash
   # Dừng tất cả node processes
   killall node
   
   # Start lại
   cd mobile-admin
   npx expo start --lan
   ```

4. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

## Lưu ý:

- Metro bundler phải chạy trước khi mở app
- iPhone và Mac phải cùng WiFi network
- Port 8081 phải không bị block bởi firewall
- Nếu dùng VPN, có thể cần tắt hoặc cấu hình lại
