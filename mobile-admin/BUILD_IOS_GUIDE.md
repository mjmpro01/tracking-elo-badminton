# Hướng dẫn Build iOS

## Cách 1: Build cho iOS Simulator (KHÔNG CẦN iPhone, KHÔNG CẦN CẮM DÂY)

### Yêu cầu:
- Mac với Xcode đã cài
- Không cần iPhone
- Không cần cắm dây

### Các bước:

```bash
cd mobile-admin

# 1. Cài đặt dependencies (nếu chưa có)
cd ios
pod install
cd ..

# 2. Build và chạy trên Simulator
npx expo run:ios

# Hoặc chỉ build mà không chạy
npx expo run:ios --no-build-cache
```

**Lưu ý:** Lần đầu build sẽ mất 5-10 phút để compile.

---

## Cách 2: Build cho iPhone Thật (CẦN iPhone, CẦN CẮM DÂY USB)

### Yêu cầu:
- Mac với Xcode
- iPhone thật
- Cáp USB để kết nối iPhone với Mac
- Apple ID (có thể dùng Personal Team miễn phí)

### Các bước:

#### Bước 1: Cấu hình Apple Developer

1. Mở Xcode → **Preferences** (Cmd + ,) → **Accounts**
2. Nhấn **+** → **Apple ID** → Thêm Apple ID của bạn
3. Chọn team (có thể chọn **Personal Team** - miễn phí)

#### Bước 2: Kết nối iPhone

1. Cắm iPhone vào Mac qua USB
2. Mở iPhone → **Settings** → **General** → **Device Management**
3. Trust máy tính nếu được hỏi

#### Bước 3: Build và cài

```bash
cd mobile-admin

# Cài dependencies
cd ios
pod install
cd ..

# Build và cài vào iPhone
npx expo run:ios --device
```

**Hoặc dùng Xcode:**

```bash
# Mở Xcode
open ios/mobileadmin.xcworkspace

# Trong Xcode:
# 1. Chọn iPhone của bạn ở thanh trên (bên cạnh nút Play)
# 2. Nhấn nút Play (▶️) hoặc Cmd+R
# 3. Xcode sẽ tự động build và cài vào iPhone
```

#### Bước 4: Trust Developer (lần đầu cài)

Sau khi cài xong trên iPhone:
1. Vào **Settings** → **General** → **VPN & Device Management**
2. Tìm app "mobile-admin" → Nhấn vào
3. Nhấn **Trust "Your Name"**
4. Nhấn **Trust** lần nữa để xác nhận

---

## Cách 3: Build IPA File (Không cần cắm dây, nhưng cần Apple Developer Account)

### Dùng EAS Build:

```bash
# Cài EAS CLI
npm install -g eas-cli

# Đăng nhập
eas login

# Build IPA
cd mobile-admin
eas build --platform ios --profile production
```

Sau khi build xong, EAS sẽ cung cấp link download IPA file.

---

## So sánh các cách:

| Cách | Cần iPhone? | Cần cắm dây? | Cần Apple ID? | Thời gian |
|------|-------------|--------------|---------------|-----------|
| **Simulator** | ❌ Không | ❌ Không | ❌ Không | ~5-10 phút |
| **iPhone thật** | ✅ Có | ✅ Có | ✅ Có (Personal Team OK) | ~5-10 phút |
| **EAS Build** | ❌ Không | ❌ Không | ✅ Có ($99/năm) | ~15-30 phút |

---

## Khuyến nghị:

1. **Test nhanh**: Dùng Simulator (`npx expo run:ios`)
2. **Test trên máy thật**: Cắm iPhone và dùng `npx expo run:ios --device`
3. **Production**: Dùng EAS Build để tạo IPA

---

## Troubleshooting

### Lỗi "No devices found"
- Đảm bảo iPhone đã được unlock
- Kiểm tra cáp USB
- Trust máy tính trên iPhone

### Lỗi "No signing certificate"
- Mở Xcode → Preferences → Accounts
- Chọn Apple ID → Download Manual Profiles
- Hoặc chọn Personal Team trong Signing & Capabilities

### Lỗi "Unable to install"
- Xóa app cũ nếu đã cài trước đó
- Đảm bảo đã trust developer trên iPhone
- Kiểm tra bundle identifier không trùng
