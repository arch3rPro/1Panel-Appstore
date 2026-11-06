#!/bin/bash

echo "🎭 Setting up Playwright Test Environment..."

# 确保目录存在
mkdir -p tests test-results

# 安装依赖
echo "📦 Installing dependencies..."
npm install

# 安装 Playwright 浏览器
echo "🌐 Installing Playwright browsers..."
npx playwright install

# 启动服务器
echo "🚀 Starting Playwright server..."
node server.js