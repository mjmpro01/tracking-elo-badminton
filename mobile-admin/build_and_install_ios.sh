#!/bin/bash

# Script tự động để build và install iOS app lên iPhone thật

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

echo "📱 Build và Install iOS App lên iPhone thật"
echo ""

# Kiểm tra iPhone đã kết nối chưa
DEVICE=$(xcrun xctrace list devices 2>/dev/null | grep -i "iphone" | grep -v "Simulator" | head -1)

if [ -z "$DEVICE" ]; then
    echo "⚠️  Không tìm thấy iPhone đã kết nối"
    echo ""
    echo "💡 Hãy:"
    echo "   1. Kết nối iPhone vào Mac qua USB"
    echo "   2. Trust computer trên iPhone (nếu được hỏi)"
    echo "   3. Enable Developer Mode: Settings → Privacy & Security → Developer Mode"
    echo "   4. Chạy lại script này"
    echo ""
    exit 1
fi

echo "✅ Tìm thấy iPhone: $DEVICE"
echo ""

# Bước 1: Prebuild
echo "1️⃣  Đang prebuild (tạo native code)..."
npx expo prebuild --clean
if [ $? -ne 0 ]; then
    echo "❌ Prebuild thất bại"
    exit 1
fi
echo "✅ Prebuild thành công"
echo ""

# Bước 2: Mở Xcode
echo "2️⃣  Đang mở Xcode..."
open ios/mobileadmin.xcworkspace
echo "✅ Đã mở Xcode"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "📋 Các bước tiếp theo trong Xcode:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Chọn project 'mobileadmin' → target 'mobileadmin'"
echo "2. Tab 'Signing & Capabilities'"
echo "   - Chọn 'Automatically manage signing'"
echo "   - Chọn Team (Apple ID của bạn)"
echo "3. Ở thanh toolbar, chọn iPhone của bạn làm target device"
echo "4. Product → Run (Cmd + R)"
echo ""
echo "💡 Lần đầu tiên:"
echo "   - Trên iPhone: Settings → General → VPN & Device Management"
echo "   - Trust developer certificate"
echo ""
