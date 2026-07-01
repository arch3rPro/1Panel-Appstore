#!/bin/bash

# n8n 汉化文件初始化脚本
# 下载对应版本的汉化 UI 文件并设置正确的权限

set -e

APP_DIR=$(cd "$(dirname "$0")/.." && pwd)
EDITOR_UI_DIR="$APP_DIR/editor-ui"
DATA_DIR="$APP_DIR/data"
N8N_VERSION="1.109.1"
CHINESE_I18N_URL="https://github.com/other-blowsnow/n8n-i18n-chinese/releases/download/n8n%40${N8N_VERSION}/editor-ui.tar.gz"

echo "开始初始化 n8n ${N8N_VERSION}..."

# 创建并设置数据目录权限
echo "设置数据目录权限..."
mkdir -p "$DATA_DIR"
# n8n 容器内使用 node 用户，UID 1000
chown -R 1000:1000 "$DATA_DIR"
chmod -R 755 "$DATA_DIR"

echo "开始下载 n8n ${N8N_VERSION} 汉化文件..."

# 创建汉化文件目录
mkdir -p "$EDITOR_UI_DIR"

# 检查是否已经存在汉化文件
if [ -f "$EDITOR_UI_DIR/index.html" ]; then
    echo "汉化文件已存在，跳过下载"
    exit 0
fi

# 创建临时目录
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# 下载汉化文件
echo "正在下载汉化文件..."
if command -v wget >/dev/null 2>&1; then
    wget -O editor-ui.tar.gz "$CHINESE_I18N_URL" || {
        echo "警告: 无法下载汉化文件，将使用英文版本"
        exit 0
    }
elif command -v curl >/dev/null 2>&1; then
    curl -L -o editor-ui.tar.gz "$CHINESE_I18N_URL" || {
        echo "警告: 无法下载汉化文件，将使用英文版本"
        exit 0
    }
else
    echo "警告: 系统中未找到 wget 或 curl，无法下载汉化文件，将使用英文版本"
    exit 0
fi

# 解压汉化文件
echo "正在解压汉化文件..."
tar -zxf editor-ui.tar.gz

# 移动文件到目标目录
if [ -d "dist" ]; then
    cp -r dist/* "$EDITOR_UI_DIR/"
    echo "汉化文件安装完成"
else
    echo "警告: 汉化文件格式异常，将使用英文版本"
fi

# 清理临时文件
cd "$APP_DIR"
rm -rf "$TEMP_DIR"

echo "n8n 汉化初始化完成"