#!/bin/bash

# Script để fix lỗi iOS Simulator runtime

echo "🔧 Đang sửa lỗi iOS Simulator runtime..."
echo ""

# 1. Clean DerivedData
echo "1️⃣  Đang xóa DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "✅ Đã xóa DerivedData"
echo ""

# 2. Clean build folder trong project
echo "2️⃣  Đang clean build folder..."
cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin/ios
if [ -d "build" ]; then
    rm -rf build
    echo "✅ Đã xóa build folder"
else
    echo "ℹ️  Không có build folder"
fi
echo ""

# 3. Kiểm tra và cài đặt thêm iOS Simulator runtime nếu cần
echo "3️⃣  Đang kiểm tra iOS Simulator runtimes..."
echo ""
echo "Các runtime hiện có:"
xcrun simctl list runtimes
echo ""

# 4. Mở Xcode để download thêm components nếu cần
echo "4️⃣  Hướng dẫn tải thêm iOS Simulator runtime:"
echo ""
echo "   Cách 1: Từ Xcode"
echo "   - Mở Xcode"
echo "   - Xcode → Settings → Platforms (hoặc Components)"
echo "   - Tải iOS Simulator runtime cho version bạn cần"
echo ""
echo "   Cách 2: Từ Command Line"
echo "   - Chạy: xcodebuild -downloadPlatform iOS"
echo ""

# 5. Thử download platform
echo "5️⃣  Đang thử tải iOS platform components..."
xcodebuild -downloadPlatform iOS 2>&1 | head -20
echo ""

# 6. Kiểm tra lại SDKs
echo "6️⃣  Các SDK hiện có:"
xcodebuild -showsdks | grep -i ios
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "💡 Giải pháp khác:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Nếu vẫn lỗi, thử các cách sau:"
echo ""
echo "1. Update project để sử dụng SDK version mới hơn:"
echo "   - Mở Xcode: open ios/mobileadmin.xcworkspace"
echo "   - Project Settings → Build Settings"
echo "   - Tìm 'iOS Deployment Target' và set thành version mới hơn"
echo ""
echo "2. Clean và rebuild:"
echo "   - Trong Xcode: Product → Clean Build Folder (Shift+Cmd+K)"
echo "   - Product → Build (Cmd+B)"
echo ""
echo "3. Xóa và cài lại pods:"
echo "   cd ios"
echo "   rm -rf Pods Podfile.lock"
echo "   pod install"
echo ""
