#!/bin/bash

# Script nhanh để build production

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

echo "🚀 Quick Build Production"
echo ""

# Kiểm tra EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI chưa được cài đặt"
    echo "   Đang cài đặt..."
    npm install -g eas-cli
    echo ""
fi

echo "Bạn muốn build platform nào?"
echo "1. iOS"
echo "2. Android"
echo "3. Cả hai"
echo ""
read -p "Chọn (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "📱 Building iOS production..."
        eas build --platform ios --profile production
        ;;
    2)
        echo ""
        echo "🤖 Building Android production..."
        eas build --platform android --profile production
        ;;
    3)
        echo ""
        echo "📱🤖 Building cả iOS và Android production..."
        eas build --platform all --profile production
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ"
        exit 1
        ;;
esac

echo ""
echo "✅ Build đã được khởi động!"
echo "💡 Kiểm tra tiến trình: eas build:list"
echo ""
