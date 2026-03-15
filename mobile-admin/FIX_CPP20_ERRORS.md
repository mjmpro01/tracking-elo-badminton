# Fix C++20 Compilation Errors

## Vấn đề:
- Code sử dụng C++20 features (concept, std::identity, std::bit_width)
- Compiler đang được set ở C++17 hoặc thấp hơn
- Lỗi: "Unknown type name 'concept'", "No type named 'identity' in namespace 'std'"

## Giải pháp đã áp dụng:

### 1. Update Podfile
Đã thay đổi C++ standard từ `c++17` sang `c++20` trong Podfile:

```ruby
# Set C++ standard thành c++20 để hỗ trợ C++20 features
config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
```

### 2. Chạy pod install
```bash
cd ios
pod install
```

### 3. Clean và rebuild
- Xóa DerivedData
- Clean build folder trong Xcode
- Build lại project

## Các C++20 features được sử dụng:
- `concept` - C++20 concepts
- `std::identity` - C++20 utility
- `std::bit_width` - C++20 bit manipulation
- Template specialization với concepts

## Lưu ý:
- Project chính đã được set C++20 từ trước
- Chỉ cần update pods để match với project chính
- Sau khi fix, các lỗi C++20 sẽ biến mất
