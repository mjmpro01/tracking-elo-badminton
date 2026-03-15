#!/bin/bash

# Script để loại bỏ EXImageLoader khỏi linker command trong Xcode project

echo "🔧 Đang fix EXImageLoader duplicate symbols trong Xcode project..."
echo ""

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin/ios

# Tìm và loại bỏ -lEXImageLoader từ project.pbxproj
if grep -q "EXImageLoader" mobileadmin.xcodeproj/project.pbxproj 2>/dev/null; then
    echo "⚠️  Tìm thấy EXImageLoader trong project.pbxproj"
    echo "   Cần fix thủ công trong Xcode:"
    echo ""
    echo "   1. Mở Xcode: open ios/mobileadmin.xcworkspace"
    echo "   2. Chọn project 'mobileadmin' → target 'mobileadmin'"
    echo "   3. Tab 'Build Phases' → 'Link Binary With Libraries'"
    echo "   4. Tìm và xóa 'libEXImageLoader.a' (nếu có)"
    echo "   5. Tab 'Build Settings' → tìm 'Other Linker Flags'"
    echo "   6. Loại bỏ '-lEXImageLoader' hoặc '-l\"EXImageLoader\"'"
    echo ""
else
    echo "✅ Không tìm thấy EXImageLoader trong project.pbxproj"
fi

echo ""
echo "💡 Hoặc thêm linker flag để bỏ qua duplicate:"
echo "   - Trong Build Settings → Other Linker Flags"
echo "   - Thêm: -Wl,-dead_strip"
echo ""
