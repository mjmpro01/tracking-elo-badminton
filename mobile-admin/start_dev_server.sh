#!/bin/bash

# Script để start Expo development server

cd /Users/duyminhle/AI/badminton-tracking-elo/mobile-admin

echo "🚀 Đang khởi động Expo development server..."
echo ""

# Kiểm tra xem có process nào đang chạy trên port 8081 không
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "⚠️  Port 8081 đang được sử dụng"
    echo "   Đang dừng process cũ..."
    kill -9 $(lsof -ti:8081) 2>/dev/null
    sleep 2
fi

# Start Expo với tunnel mode để đảm bảo kết nối
echo "📱 Starting Expo development server..."
echo "   IP: 192.168.1.146"
echo "   Port: 8081"
echo ""

# Start Expo với LAN mode
npx expo start --lan --port 8081
