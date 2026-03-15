#!/bin/bash

# Script để cấu hình Xcode sau khi cài đặt

echo "🔧 Đang cấu hình Xcode..."
echo ""

# Kiểm tra Xcode đã được cài đặt chưa
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode chưa được cài đặt!"
    echo "   Vui lòng cài đặt Xcode từ App Store trước."
    echo "   Chạy: ./install_xcode.sh"
    exit 1
fi

echo "✅ Tìm thấy Xcode.app"
echo ""

# 1. Chọn Xcode làm developer directory
echo "1️⃣  Đang chọn Xcode làm developer directory..."
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
if [ $? -eq 0 ]; then
    echo "   ✅ Đã chọn Xcode làm developer directory"
else
    echo "   ⚠️  Có lỗi xảy ra. Có thể cần nhập mật khẩu admin."
fi
echo ""

# 2. Chấp nhận license
echo "2️⃣  Đang chấp nhận license..."
sudo xcodebuild -license accept 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ Đã chấp nhận license"
else
    echo "   ⚠️  Có thể cần chấp nhận license thủ công trong Xcode"
fi
echo ""

# 3. Kiểm tra Command Line Tools
echo "3️⃣  Đang kiểm tra Command Line Tools..."
if xcode-select -p &> /dev/null; then
    echo "   ✅ Command Line Tools đã được cài đặt"
    CLT_PATH=$(xcode-select -p)
    echo "   📍 Path: $CLT_PATH"
else
    echo "   ⚠️  Command Line Tools chưa được cài đặt"
    echo "   💡 Chạy: xcode-select --install"
fi
echo ""

# 4. Kiểm tra version
echo "4️⃣  Đang kiểm tra Xcode version..."
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version 2>/dev/null | head -n 1)
    echo "   ✅ $XCODE_VERSION"
else
    echo "   ⚠️  Không thể kiểm tra version"
fi
echo ""

# 5. Kiểm tra iOS SDK
echo "5️⃣  Đang kiểm tra iOS SDK..."
SDK_PATH=$(xcodebuild -showsdks 2>/dev/null | grep -i ios | head -n 1)
if [ ! -z "$SDK_PATH" ]; then
    echo "   ✅ $SDK_PATH"
else
    echo "   ⚠️  Không tìm thấy iOS SDK"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Hoàn tất cấu hình Xcode!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 Bước tiếp theo cho dự án React Native/Expo:"
echo "   1. cd mobile-admin/ios"
echo "   2. pod install"
echo "   3. Mở Xcode: open ios/mobileadmin.xcworkspace"
echo ""
