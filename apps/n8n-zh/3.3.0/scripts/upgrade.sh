#!/bin/bash

# n8n 汉化文件升级脚本
# 在升级时重新下载对应版本的汉化文件并设置正确权限

set -e

APP_DIR=$(cd "$(dirname "$0")/.." && pwd)
EDITOR_UI_DIR="$APP_DIR/editor-ui"
DATA_DIR="$APP_DIR/data"

echo "开始 n8n 汉化文件升级..."

# 设置数据目录权限
echo "设置数据目录权限..."
if [ -d "$DATA_DIR" ]; then
    chown -R 1000:1000 "$DATA_DIR"
    chmod -R 755 "$DATA_DIR"
fi

# 清理旧的汉化文件
if [ -d "$EDITOR_UI_DIR" ]; then
    echo "清理旧的汉化文件..."
    rm -rf "$EDITOR_UI_DIR"
fi

# 调用初始化脚本重新下载汉化文件
"$APP_DIR/scripts/init.sh"

echo "n8n 汉化文件升级完成"