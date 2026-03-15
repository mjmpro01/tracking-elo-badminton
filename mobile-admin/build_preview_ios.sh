#!/bin/bash

# Script để build iOS preview build (cho device thật, không cần Metro)

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

echo "📱 Build iOS Preview (cho iPhone thật)"
echo ""

# Kiểm tra EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI chưa được cài đặt"
    echo "   Đang cài đặt..."
    npm install -g eas-cli
    echo ""
fi

# Kiểm tra đã đăng nhập chưa
if ! eas whoami &> /dev/null; then
    echo "⚠️  Chưa đăng nhập Expo account"
    echo ""
    echo "📝 Đăng nhập Expo account:"
    echo "   eas login"
    echo ""
    echo "   Hoặc tạo account mới tại: https://expo.dev"
    echo ""
    read -p "Bạn có muốn đăng nhập ngay bây giờ không? (y/n): " login_choice
    
    if [ "$login_choice" = "y" ] || [ "$login_choice" = "Y" ]; then
        echo ""
        echo "🔐 Đang mở trình đăng nhập..."
        eas login
    else
        echo ""
        echo "❌ Cần đăng nhập để build. Chạy: eas login"
        exit 1
    fi
fi

echo "✅ Đã đăng nhập Expo"
echo ""

# Kiểm tra đã configure chưa
if [ ! -f ".eas.json" ] && [ ! -f "eas.json" ]; then
    echo "⚙️  Đang cấu hình project..."
    eas build:configure
    echo ""
fi

echo "═══════════════════════════════════════════════════════════"
echo "🚀 Bắt đầu build iOS Preview..."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Thông tin build:"
echo "   - Platform: iOS"
echo "   - Profile: preview"
echo "   - Distribution: internal (ad-hoc)"
echo "   - Không cần Metro bundler ✅"
echo ""
echo "⏱️  Build sẽ mất khoảng 15-30 phút"
echo ""

# Build preview
eas build --platform ios --profile preview

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Build đã được khởi động!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 Sau khi build xong:"
echo "   1. EAS sẽ cung cấp QR code hoặc link download"
echo "   2. Mở link trên iPhone (Safari)"
echo "   3. Download file .ipa"
echo "   4. Cài đặt lên iPhone"
echo ""
echo "📱 Kiểm tra tiến trình build:"
echo "   eas build:list"
echo ""
