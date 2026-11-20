#!/bin/bash
set -euo pipefail

APP_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# Refuse an in-place 1.x upgrade: its PostgreSQL cluster was mounted at ./data.
if [ -f "$APP_DIR/data/PG_VERSION" ]; then
    echo '检测到 LobeChat 1.x 数据库。请先备份并按 README 在独立实例迁移，禁止直接升级。' >&2
    exit 1
fi
mkdir -p "$APP_DIR/data/rustfs"
# The official RustFS image runs as UID/GID 10001.
chown 10001:10001 "$APP_DIR/data/rustfs"
chmod 750 "$APP_DIR/data/rustfs"
