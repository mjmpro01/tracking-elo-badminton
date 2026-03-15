# Khi nào cần Metro Bundler?

## Tóm tắt nhanh:

| Loại Build | Cần Metro Bundler? | Lý do |
|------------|-------------------|-------|
| **Development Build** (developmentClient: true) | ✅ **CÓ** | App vẫn cần kết nối đến dev server |
| **Preview Build** (ad-hoc) | ❌ **KHÔNG** | JavaScript bundle đã embed sẵn |
| **Production Build** | ❌ **KHÔNG** | JavaScript bundle đã embed sẵn |
| **Expo Go** | ✅ **CÓ** | Luôn cần Metro bundler |

---

## Chi tiết:

### ✅ CẦN Metro Bundler:

#### 1. Development Build với Development Client
```bash
eas build --platform ios --profile development
```
- App được build với `developmentClient: true`
- App vẫn cần kết nối đến Metro bundler
- Cho phép hot reload, fast refresh
- **Cần chạy:** `npx expo start` hoặc `npm start`

#### 2. Expo Go
- Luôn cần Metro bundler
- Expo Go chỉ là container, code chạy từ Metro server

#### 3. Development với Simulator/Device (khi dùng `expo run:ios`)
- Cần Metro bundler để serve JavaScript code
- Code được bundle động mỗi lần chạy

---

### ❌ KHÔNG CẦN Metro Bundler:

#### 1. Preview Build (Ad-hoc)
```bash
eas build --platform ios --profile preview
```
- JavaScript bundle đã được **embed sẵn** trong app
- App chạy độc lập, không cần server
- Có thể cài đặt và chạy trên device mà không cần Metro

#### 2. Production Build
```bash
eas build --platform ios --profile production
```
- JavaScript bundle đã được **embed sẵn** trong app
- App chạy độc lập hoàn toàn
- Không cần bất kỳ server nào

#### 3. Build Local và Archive trong Xcode
- Khi build Release configuration
- JavaScript bundle được bundle vào app
- Không cần Metro bundler

---

## Làm sao biết app có cần Metro không?

### Kiểm tra trong code:

**Development Build:**
- Có `developmentClient: true` trong eas.json
- App sẽ hiển thị error nếu không kết nối được Metro
- Có thể reload JS từ app

**Production/Preview Build:**
- JavaScript bundle đã embed sẵn
- App chạy ngay cả khi không có internet
- Không có option reload JS

---

## Kết luận cho trường hợp của bạn:

### Nếu build **Preview** hoặc **Production**:
```bash
# Preview build (cho device thật, không cần Metro)
eas build --platform ios --profile preview

# Hoặc build local với Xcode (Release mode)
# → KHÔNG CẦN Metro bundler ✅
```

### Nếu build **Development**:
```bash
# Development build (vẫn cần Metro)
eas build --platform ios --profile development
# → VẪN CẦN Metro bundler ⚠️
```

---

## Khuyến nghị:

**Cho device thật (không cần Metro):**
- Dùng **Preview build** hoặc **Production build**
- Build local với Xcode (Release configuration)
- App chạy độc lập, không cần server

**Cho development (cần Metro):**
- Dùng **Development build** hoặc **Expo Go**
- Cần chạy Metro bundler
- Có hot reload, dễ debug
