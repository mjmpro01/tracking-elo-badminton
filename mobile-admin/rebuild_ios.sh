#!/bin/bash

# Script để rebuild iOS project sau khi fix simulator runtime

echo "🔨 Đang rebuild iOS project..."
echo ""

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

# 1. Clean pods
echo "1️⃣  Đang clean pods..."
cd ios
rm -rf Pods/build
echo "✅ Đã clean pods"
echo ""

# 2. Reinstall pods
echo "2️⃣  Đang reinstall pods..."
pod install
echo ""

# 3. Clean Xcode build
echo "3️⃣  Đang clean Xcode build..."
xcodebuild clean -workspace mobileadmin.xcworkspace -scheme mobileadmin -quiet
echo "✅ Đã clean Xcode build"
echo ""

# 4. Kiểm tra build settings
echo "4️⃣  Kiểm tra build settings..."
SDK_VERSION=$(xcodebuild -project mobileadmin.xcodeproj -showBuildSettings 2>/dev/null | grep "SDKROOT" | head -1 | awk '{print $3}' | xargs basename)
echo "   📍 SDK: $SDK_VERSION"
echo ""

DEPLOYMENT_TARGET=$(xcodebuild -project mobileadmin.xcodeproj -showBuildSettings 2>/dev/null | grep "IPHONEOS_DEPLOYMENT_TARGET" | head -1 | awk '{print $3}')
echo "   📍 Deployment Target: $DEPLOYMENT_TARGET"
echo ""

# 5. Thử build để kiểm tra
echo "5️⃣  Đang thử build (dry-run)..."
echo "   (Chỉ kiểm tra cấu hình, không build thực sự)"
echo ""

# Kiểm tra xem có thể resolve build settings không
xcodebuild -workspace mobileadmin.xcworkspace -scheme mobileadmin -showBuildSettings -configuration Debug 2>&1 | grep -E "SDKROOT|IPHONEOS_DEPLOYMENT_TARGET|error" | head -5

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Hoàn tất!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 Bước tiếp theo:"
echo "   1. Mở Xcode: open ios/mobileadmin.xcworkspace"
echo "   2. Product → Clean Build Folder (Shift+Cmd+K)"
echo "   3. Chọn một iOS Simulator (ví dụ: iPhone 15)"
echo "   4. Product → Build (Cmd+B)"
echo ""
echo "⚠️  Nếu vẫn còn lỗi về simulator runtime:"
echo "   - Xcode → Settings → Platforms"
echo "   - Tải iOS Simulator runtime cho version bạn cần"
echo "   - Hoặc chọn một simulator khác đã có sẵn"
echo ""
