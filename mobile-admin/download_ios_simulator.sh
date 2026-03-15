#!/bin/bash

# Script hướng dẫn và tải iOS Simulator Runtime

echo "📱 Hướng dẫn tải iOS Simulator Runtime"
echo ""

# Kiểm tra Xcode
if [ ! -d "/Applications/Xcode.app" ]; then
    echo "❌ Xcode chưa được cài đặt!"
    echo "   Vui lòng cài đặt Xcode trước."
    exit 1
fi

echo "✅ Xcode đã được cài đặt"
echo ""

# Kiểm tra runtimes hiện có
echo "📋 Các iOS Simulator Runtime hiện có:"
echo ""
xcrun simctl list runtimes
echo ""

# Hướng dẫn cách 1: Từ Xcode GUI
echo "═══════════════════════════════════════════════════════════"
echo "CÁCH 1: Tải từ Xcode (Khuyến nghị - Dễ nhất)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Mở Xcode"
echo "2. Vào: Xcode → Settings (hoặc Preferences)"
echo "   Hoặc nhấn: Cmd + ,"
echo "3. Chọn tab 'Platforms' (hoặc 'Components')"
echo "4. Tìm 'iOS Simulator' trong danh sách"
echo "5. Nhấn nút 'Download' (⬇️) bên cạnh version bạn muốn"
echo "6. Chờ tải xuống (10-30 phút tùy version)"
echo ""
echo "💡 Mở Xcode Settings ngay bây giờ?"
read -p "   (Nhấn Enter để mở, hoặc Ctrl+C để bỏ qua): " 
if [ $? -eq 0 ]; then
    echo "🔄 Đang mở Xcode..."
    open -a Xcode
    echo ""
    echo "   Sau khi Xcode mở, nhấn: Cmd + , để mở Settings"
fi
echo ""

# Hướng dẫn cách 2: Từ Command Line
echo "═══════════════════════════════════════════════════════════"
echo "CÁCH 2: Tải từ Command Line"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Bạn có muốn thử tải iOS Simulator runtime từ command line không?"
echo "Lưu ý: Cách này có thể yêu cầu đăng nhập Apple ID"
echo ""
read -p "Tải iOS Simulator runtime? (y/n): " download_choice

if [ "$download_choice" = "y" ] || [ "$download_choice" = "Y" ]; then
    echo ""
    echo "🔄 Đang tải iOS Simulator runtime..."
    echo "   (Có thể mất vài phút, vui lòng đợi...)"
    echo ""
    
    xcodebuild -downloadPlatform iOS 2>&1 | tee /tmp/xcode_download.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo ""
        echo "✅ Tải thành công!"
        echo ""
        echo "📋 Kiểm tra lại runtimes:"
        xcrun simctl list runtimes
    else
        echo ""
        echo "⚠️  Có thể cần đăng nhập Apple ID trong Xcode"
        echo "   Hoặc tải từ Xcode Settings (Cách 1)"
        echo ""
        echo "📄 Log chi tiết: /tmp/xcode_download.log"
    fi
else
    echo ""
    echo "ℹ️  Bỏ qua tải từ command line"
    echo "   Vui lòng tải từ Xcode Settings (Cách 1)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💡 Sau khi tải xong:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Kiểm tra runtimes:"
echo "   xcrun simctl list runtimes"
echo ""
echo "2. Xem danh sách devices:"
echo "   xcrun simctl list devices"
echo ""
echo "3. Tạo simulator mới (nếu cần):"
echo "   xcrun simctl create 'iPhone Test' 'iPhone 15' 'iOS-26-3'"
echo ""
