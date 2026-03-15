# Sửa lỗi Duplicate Symbol EXImageLoader

## Lỗi:
```
duplicate symbol '_OBJC_METACLASS_$_EXImageLoader' in
┌─ libEXImageLoader.a[2](EXImageLoader.o)
└─ libExpoModulesCore.a[7](EXImageLoader.o)
```

## Nguyên nhân:
Cả `expo-image` và `expo-modules-core` đều export `EXImageLoader`, gây xung đột.

## Giải pháp:

### Cách 1: Build trong Xcode và exclude duplicate

1. Mở Xcode workspace
2. Chọn project **mobileadmin** → target **mobileadmin**
3. Tab **Build Phases** → **Link Binary With Libraries**
4. Tìm và xóa một trong hai:
   - `libEXImageLoader.a` (từ expo-image)
   - Hoặc exclude `EXImageLoader` từ `libExpoModulesCore.a`

### Cách 2: Thêm vào Podfile (Khuyến nghị)

Thêm vào `ios/Podfile` trong `post_install`:

```ruby
post_install do |installer|
  react_native_post_install(
    installer,
    config[:reactNativePath],
    :mac_catalyst_enabled => false,
    :ccache_enabled => ccache_enabled?(podfile_properties),
  )
  
  # Fix duplicate EXImageLoader
  installer.pods_project.targets.each do |target|
    if target.name == 'EXImageLoader'
      target.build_configurations.each do |config|
        config.build_settings['EXCLUDED_ARCHS[sdk=*]'] = 'arm64'
      end
    end
  end
end
```

Sau đó chạy:
```bash
cd ios
pod install
```

### Cách 3: Update dependencies

Có thể cần update `expo-image` hoặc `expo-modules-core` lên version mới hơn:

```bash
npm update expo-image expo-modules-core
npx expo prebuild -p ios --clean
```

---

## Đã sửa:
✅ `ExpoAppDelegate.getSubscriberOfType` → `ExpoAppDelegateSubscriberRepository.getSubscriberOfType`
✅ `EXFatal(EXErrorWithMessage(...))` → `assertionFailure(...)`
✅ **Đã thêm post_install hook vào Podfile để fix duplicate EXImageLoader symbols:**
   - Loại bỏ `-l"EXImageLoader"` khỏi `OTHER_LDFLAGS` trong build settings
   - Loại bỏ `-l"EXImageLoader"` khỏi xcconfig files
   - Set C++ standard thành `c++17`
   - Đã chạy `pod install` thành công
