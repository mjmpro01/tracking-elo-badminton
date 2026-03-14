# Sửa lỗi "Cannot initialize a parameter of type 'char *' with 'const char *'"

Lỗi này xảy ra trong ExpoModulesJSI do vấn đề const correctness trong C++.

## Giải pháp 1: Thêm compiler flag trong Xcode

1. Mở Xcode
2. Chọn project **mobileadmin** → target **mobileadmin**
3. Tab **Build Settings**
4. Tìm **"Other C++ Flags"** (gõ "c++ flags" vào search box)
5. Thêm flag sau cho cả Debug và Release:
   ```
   -Wno-error=deprecated-declarations
   -Wno-deprecated-declarations
   ```

## Giải pháp 2: Sửa trong Podfile

Thêm vào `post_install` hook trong Podfile:

```ruby
post_install do |installer|
  # ... existing code ...
  
  installer.pods_project.targets.each do |target|
    if target.name == 'ExpoModulesJSI' || target.name == 'mobileadmin'
      target.build_configurations.each do |config|
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] ||= ['$(inherited)']
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-error=deprecated-declarations'
        config.build_settings['OTHER_CPLUSPLUSFLAGS'] << '-Wno-deprecated-declarations'
      end
    end
  end
end
```

Sau đó chạy:
```bash
cd ios && pod install
```

## Giải pháp 3: Downgrade Xcode hoặc cập nhật Expo

Nếu vẫn lỗi, có thể do phiên bản Xcode quá mới. Thử:
- Sử dụng Xcode 15.x thay vì 16.x
- Hoặc cập nhật Expo SDK lên phiên bản mới nhất hỗ trợ Xcode 16
