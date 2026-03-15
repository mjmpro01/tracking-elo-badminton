#!/bin/bash

# Script để build production

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

echo "🚀 Hướng dẫn Build Production"
echo ""

# Kiểm tra EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 Đang cài đặt EAS CLI..."
    npm install -g eas-cli
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo "CÁCH 1: Build với EAS Build (Khuyến nghị)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Bước 1: Đăng nhập Expo account"
echo "   eas login"
echo ""
echo "Bước 2: Cấu hình project (nếu chưa có)"
echo "   eas build:configure"
echo ""
echo "Bước 3: Build production"
echo "   # iOS:"
echo "   eas build --platform ios --profile production"
echo ""
echo "   # Android:"
echo "   eas build --platform android --profile production"
echo ""
echo "   # Cả hai:"
echo "   eas build --platform all --profile production"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "CÁCH 2: Build Local (iOS với Xcode)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Bước 1: Prebuild"
echo "   npx expo prebuild --clean"
echo ""
echo "Bước 2: Mở Xcode và Archive"
echo "   open ios/mobileadmin.xcworkspace"
echo "   Product → Archive → Distribute App"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💡 Lưu ý:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⚠️  Bundle Identifier hiện tại: com.mobileadmin.app.dev"
echo "   Cần đổi thành: com.mobileadmin.app (cho production)"
echo ""
echo "📝 Checklist trước khi build:"
echo "   [ ] Đã cập nhật bundle identifier trong app.json"
echo "   [ ] Đã test kỹ trên device thật"
echo "   [ ] Đã set production API endpoints"
echo "   [ ] Đã tắt debug mode"
echo ""
