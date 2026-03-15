#!/bin/bash

# Script để gỡ cài đặt iOS Simulator Runtime

echo "🗑️  Gỡ cài đặt iOS Simulator Runtime"
echo ""

# Kiểm tra runtimes hiện có
echo "📋 Các iOS Simulator Runtime hiện có:"
echo ""
xcrun simctl list runtimes
echo ""

# Tìm iOS 26 runtime
IOS_26_RUNTIME=$(xcrun simctl list runtimes | grep -i "iOS 26" | head -1)

if [ -z "$IOS_26_RUNTIME" ]; then
    echo "ℹ️  Không tìm thấy iOS 26 runtime"
    exit 0
fi

echo "🔍 Tìm thấy iOS 26 runtime:"
echo "   $IOS_26_RUNTIME"
echo ""

# Extract runtime identifier
RUNTIME_ID=$(echo "$IOS_26_RUNTIME" | grep -oE "com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+" | head -1)

if [ -z "$RUNTIME_ID" ]; then
    echo "⚠️  Không thể xác định runtime identifier"
    echo ""
    echo "💡 Cách gỡ cài đặt thủ công:"
    echo "   1. Mở Xcode"
    echo "   2. Xcode → Settings → Platforms"
    echo "   3. Tìm iOS 26 Simulator"
    echo "   4. Nhấn nút 'Remove' (🗑️) hoặc 'Delete'"
    exit 1
fi

echo "📌 Runtime ID: $RUNTIME_ID"
echo ""

# Xác nhận
echo "⚠️  CẢNH BÁO: Gỡ cài đặt iOS 26 Simulator runtime sẽ:"
echo "   - Xóa tất cả simulators sử dụng runtime này"
echo "   - Bạn sẽ không thể chạy app trên iOS 26 simulator nữa"
echo ""
read -p "Bạn có chắc chắn muốn gỡ cài đặt iOS 26? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Đã hủy."
    exit 0
fi

echo ""
echo "🔄 Đang gỡ cài đặt iOS 26 Simulator runtime..."
echo ""

# Cách 1: Xóa qua xcrun simctl (nếu có quyền)
echo "1️⃣  Đang thử xóa runtime..."
xcrun simctl runtime delete "$RUNTIME_ID" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Đã xóa runtime thành công!"
else
    echo "⚠️  Không thể xóa qua command line"
    echo ""
    echo "2️⃣  Hướng dẫn xóa thủ công từ Xcode:"
    echo ""
    echo "   Cách 1: Từ Xcode Settings"
    echo "   1. Mở Xcode"
    echo "   2. Xcode → Settings (Cmd+,)"
    echo "   3. Tab 'Platforms' (hoặc 'Components')"
    echo "   4. Tìm 'iOS 26.3 Simulator'"
    echo "   5. Nhấn nút 'Remove' (🗑️) hoặc 'Delete'"
    echo ""
    echo "   Cách 2: Xóa thư mục runtime"
    echo "   Runtime thường nằm tại:"
    echo "   ~/Library/Developer/CoreSimulator/Runtimes/"
    echo ""
    echo "   Chạy lệnh sau để xóa:"
    echo "   rm -rf ~/Library/Developer/CoreSimulator/Runtimes/iOS-26-3.simruntime"
    echo ""
    
    read -p "Bạn có muốn thử xóa thư mục runtime không? (y/n): " delete_folder
    
    if [ "$delete_folder" = "y" ] || [ "$delete_folder" = "Y" ]; then
        echo ""
        echo "🔄 Đang xóa thư mục runtime..."
        rm -rf ~/Library/Developer/CoreSimulator/Runtimes/iOS-26-3.simruntime 2>/dev/null
        rm -rf ~/Library/Developer/CoreSimulator/Runtimes/iOS-26*.simruntime 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Đã xóa thư mục runtime"
        else
            echo "⚠️  Không tìm thấy thư mục hoặc không có quyền xóa"
        fi
    fi
fi

echo ""
echo "📋 Kiểm tra lại runtimes:"
xcrun simctl list runtimes
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Hoàn tất!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "💡 Lưu ý:"
echo "   - Nếu vẫn thấy iOS 26 trong danh sách, xóa từ Xcode Settings"
echo "   - Có thể cần restart Xcode để cập nhật"
echo ""
