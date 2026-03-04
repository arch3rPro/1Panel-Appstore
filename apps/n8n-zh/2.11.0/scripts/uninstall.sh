#!/bin/bash

# n8n 汉化文件卸载脚本
# 清理汉化相关文件

set -e

APP_DIR=$(cd "$(dirname "$0")/.." && pwd)
EDITOR_UI_DIR="$APP_DIR/editor-ui"

echo "开始清理 n8n 汉化文件..."

# 清理汉化文件目录
if [ -d "$EDITOR_UI_DIR" ]; then
    echo "清理汉化文件目录..."
    rm -rf "$EDITOR_UI_DIR"
fi

echo "n8n 汉化文件清理完成"