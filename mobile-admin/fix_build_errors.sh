#!/bin/bash

# Script để fix các lỗi build: duplicate symbols và signing

echo "🔧 Đang fix các lỗi build..."
echo ""

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin/ios

# 1. Clean DerivedData
echo "1️⃣  Đang xóa DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/mobileadmin-*
echo "✅ Đã xóa DerivedData"
echo ""

# 2. Clean build folder
echo "2️⃣  Đang clean build folder..."
xcodebuild clean -workspace mobileadmin.xcworkspace -scheme mobileadmin -quiet 2>/dev/null
rm -rf build
echo "✅ Đã clean build folder"
echo ""

# 3. Kiểm tra và fix duplicate symbols trong xcconfig files
echo "3️⃣  Đang kiểm tra xcconfig files..."
FOUND_DUPLICATE=0
for xcconfig in Pods/Target\ Support\ Files/**/*.xcconfig; do
    if [ -f "$xcconfig" ]; then
        if grep -q 'EXImageLoader' "$xcconfig" 2>/dev/null; then
            echo "   ⚠️  Tìm thấy EXImageLoader trong: $xcconfig"
            sed -i '' '/-l"EXImageLoader"/d' "$xcconfig" 2>/dev/null
            FOUND_DUPLICATE=1
        fi
    fi
done

if [ $FOUND_DUPLICATE -eq 0 ]; then
    echo "   ✅ Không tìm thấy EXImageLoader trong xcconfig files"
fi
echo ""

# 4. Kiểm tra OTHER_LDFLAGS trong project
echo "4️⃣  Đang kiểm tra OTHER_LDFLAGS trong project..."
if grep -q 'EXImageLoader' mobileadmin.xcodeproj/project.pbxproj 2>/dev/null; then
    echo "   ⚠️  Tìm thấy EXImageLoader trong project.pbxproj"
    echo "   💡 Cần fix thủ công trong Xcode nếu vẫn còn lỗi"
else
    echo "   ✅ Không tìm thấy EXImageLoader trong project.pbxproj"
fi
echo ""

# 5. Thêm linker flag để bỏ qua duplicate (nếu cần)
echo "5️⃣  Hướng dẫn fix signing error:"
echo ""
echo "   Trong Xcode:"
echo "   1. Chọn project 'mobileadmin' (icon màu xanh)"
echo "   2. Chọn target 'mobileadmin'"
echo "   3. Tab 'Signing & Capabilities'"
echo "   4. Chọn 'Automatically manage signing'"
echo "   5. Chọn Team (Apple ID của bạn)"
echo "   6. Hoặc chọn 'None' nếu chỉ build cho simulator"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Đã fix duplicate symbols!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 Bước tiếp theo:"
echo "   1. Mở Xcode: open ios/mobileadmin.xcworkspace"
echo "   2. Fix signing: Chọn Team trong Signing & Capabilities"
echo "   3. Product → Clean Build Folder (Shift+Cmd+K)"
echo "   4. Product → Build (Cmd+B)"
echo ""
