#!/bin/bash

# Script hướng dẫn cài đặt Xcode trên macOS

echo "📦 Hướng dẫn cài đặt Xcode"
echo ""

# Kiểm tra macOS version
MACOS_VERSION=$(sw_vers -productVersion)
echo "🖥️  macOS Version: $MACOS_VERSION"
echo ""

echo "Có 2 cách để cài đặt Xcode:"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "CÁCH 1: Cài đặt từ App Store (Khuyến nghị - Dễ nhất)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Mở App Store trên Mac"
echo "2. Tìm kiếm 'Xcode'"
echo "3. Nhấn 'Get' hoặc 'Install'"
echo "4. Đăng nhập bằng Apple ID nếu được yêu cầu"
echo "5. Chờ tải xuống (khoảng 4-7GB, có thể mất 30-60 phút)"
echo "6. Sau khi cài đặt xong, mở Xcode lần đầu để chấp nhận license"
echo ""
echo "Hoặc mở trực tiếp bằng lệnh:"
echo "   open -a 'App Store' 'https://apps.apple.com/app/xcode/id497799835'"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "CÁCH 2: Tải từ developer.apple.com"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Truy cập: https://developer.apple.com/download/all/"
echo "2. Đăng nhập bằng Apple Developer account"
echo "3. Tìm và tải Xcode (file .xip)"
echo "4. Giải nén file .xip (double-click)"
echo "5. Di chuyển Xcode.app vào /Applications"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Sau khi cài đặt xong, chạy các lệnh sau:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "# 1. Chọn Xcode làm developer directory"
echo "sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
echo ""
echo "# 2. Chấp nhận license"
echo "sudo xcodebuild -license accept"
echo ""
echo "# 3. Cài đặt Command Line Tools (nếu cần)"
echo "xcode-select --install"
echo ""
echo "# 4. Kiểm tra version"
echo "xcodebuild -version"
echo ""

# Kiểm tra xem có thể mở App Store không
if command -v open &> /dev/null; then
    echo "💡 Bạn có muốn mở App Store để cài đặt Xcode ngay bây giờ không?"
    echo "   (Nhấn Enter để mở App Store, hoặc Ctrl+C để hủy)"
    read -p "   "
    if [ $? -eq 0 ]; then
        echo "🔄 Đang mở App Store..."
        open -a 'App Store' 'https://apps.apple.com/app/xcode/id497799835'
        echo "✅ Đã mở App Store. Vui lòng nhấn 'Get' để cài đặt Xcode."
    fi
else
    echo "⚠️  Không thể mở App Store tự động."
    echo "   Vui lòng mở App Store thủ công và tìm kiếm 'Xcode'"
fi
