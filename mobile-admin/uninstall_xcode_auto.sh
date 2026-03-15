#!/bin/bash

# Script để gỡ cài đặt Xcode tự động (không cần xác nhận)

echo "🔄 Đang gỡ cài đặt Xcode..."

# 1. Xóa Xcode.app
if [ -d "/Applications/Xcode.app" ]; then
    echo "📦 Đang xóa /Applications/Xcode.app..."
    sudo rm -rf /Applications/Xcode.app
    echo "✅ Đã xóa Xcode.app"
else
    echo "ℹ️  Không tìm thấy /Applications/Xcode.app"
fi

# 2. Xóa Command Line Tools
if [ -d "/Library/Developer/CommandLineTools" ]; then
    echo "📦 Đang xóa Command Line Tools..."
    sudo rm -rf /Library/Developer/CommandLineTools
    echo "✅ Đã xóa Command Line Tools"
else
    echo "ℹ️  Không tìm thấy Command Line Tools"
fi

# 3. Xóa DerivedData và cache
echo "📦 Đang xóa DerivedData và cache..."
rm -rf ~/Library/Developer/Xcode 2>/dev/null
rm -rf ~/Library/Caches/com.apple.dt.Xcode 2>/dev/null
rm -rf ~/Library/Application\ Support/Xcode 2>/dev/null
rm -rf ~/Library/Preferences/com.apple.dt.Xcode.plist 2>/dev/null
echo "✅ Đã xóa cache và preferences"

# 4. Xóa CoreSimulator và các file khác
echo "📦 Đang xóa CoreSimulator..."
rm -rf ~/Library/Developer/CoreSimulator 2>/dev/null
rm -rf ~/Library/Developer/Xcode-iOS 2>/dev/null
echo "✅ Đã xóa CoreSimulator"

# 5. Xóa các file cấu hình khác
echo "📦 Đang xóa các file cấu hình khác..."
rm -rf ~/Library/Saved\ Application\ State/com.apple.dt.Xcode.savedState 2>/dev/null
rm -rf ~/Library/Logs/CoreSimulator 2>/dev/null
echo "✅ Đã xóa các file cấu hình"

echo ""
echo "✅ Hoàn tất! Xcode đã được gỡ cài đặt."
echo ""
echo "💡 Lưu ý:"
echo "   - Bạn có thể cần restart máy để hoàn tất"
echo "   - Để cài lại Xcode, tải từ App Store hoặc developer.apple.com"
echo "   - Sau khi cài lại, chạy: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
