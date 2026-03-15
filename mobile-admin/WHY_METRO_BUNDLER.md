# Tại sao phải run Metro Bundler?

## Metro Bundler là gì?

Metro Bundler (hay Metro) là **JavaScript bundler** được Facebook tạo ra cho React Native. Nó có vai trò tương tự như webpack cho web development.

## Vai trò của Metro Bundler:

### 1. **Bundle JavaScript Code**
- **Trong development:** Metro bundler đọc tất cả file JavaScript/TypeScript trong project
- **Transform code:** Chuyển đổi JSX, TypeScript, ES6+ thành JavaScript thuần mà JavaScript engine có thể hiểu
- **Bundle:** Gộp tất cả code thành một file bundle duy nhất
- **Serve:** Cung cấp bundle này cho app qua HTTP server (port 8081)

### 2. **Hot Reload / Fast Refresh**
- Khi bạn sửa code, Metro bundler tự động:
  - Phát hiện thay đổi
  - Re-bundle code mới
  - Gửi code mới đến app
  - App tự động reload với code mới
- Giúp bạn thấy thay đổi ngay lập tức mà không cần rebuild app

### 3. **Development Server**
- Metro chạy một HTTP server trên port 8081
- App (iOS/Android) kết nối đến server này để lấy JavaScript bundle
- Cho phép development trên nhiều devices cùng lúc

## Quy trình hoạt động:

```
1. Bạn viết code (JavaScript/TypeScript/JSX)
   ↓
2. Metro Bundler đọc và transform code
   ↓
3. Metro tạo bundle và serve trên http://localhost:8081
   ↓
4. App (iOS/Android) kết nối đến Metro server
   ↓
5. App download bundle và chạy code
   ↓
6. Khi bạn sửa code → Metro tự động re-bundle → App reload
```

## Tại sao cần Metro Bundler?

### ❌ **Không có Metro Bundler:**
- App sẽ không có JavaScript code để chạy
- Bạn sẽ thấy lỗi: "Could not connect to development server"
- Hoặc: "No script URL provided"
- App không thể render UI, không thể chạy logic

### ✅ **Có Metro Bundler:**
- App có JavaScript bundle để chạy
- Hot reload hoạt động (thấy thay đổi ngay lập tức)
- Development nhanh hơn (không cần rebuild native code)
- Có thể debug và test trên nhiều devices

## Khi nào cần Metro Bundler?

### Development Mode (Development):
- ✅ **CẦN** Metro Bundler
- Code được bundle động mỗi lần app chạy
- Cho phép hot reload, fast refresh
- Dễ debug và development

### Production Build (Release):
- ❌ **KHÔNG CẦN** Metro Bundler
- JavaScript bundle được embed sẵn trong app
- App chạy độc lập, không cần server
- Được build vào file .ipa (iOS) hoặc .apk (Android)

## Cách chạy Metro Bundler:

### Tự động (khi dùng Expo):
```bash
npx expo start
# Hoặc
npm start
```

### Thủ công:
```bash
npx react-native start
# Hoặc
npx expo start --lan
```

## Lưu ý:

1. **Metro phải chạy trước khi mở app** trong development mode
2. **App và Metro phải cùng network** (hoặc dùng tunnel mode)
3. **Port 8081** phải không bị block bởi firewall
4. **Trong production build**, Metro không cần thiết vì bundle đã được embed sẵn

## Tóm tắt:

Metro Bundler = **"Bộ não" của React Native app trong development**
- Không có Metro → App không có JavaScript code → App không chạy được
- Có Metro → App có code → App chạy được → Development nhanh và dễ dàng
