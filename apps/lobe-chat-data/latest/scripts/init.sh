#!/bin/bash
set -euo pipefail

APP_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# Refuse an in-place 1.x upgrade: its PostgreSQL cluster was mounted at ./data.
if [ -f "$APP_DIR/data/PG_VERSION" ]; then
    echo '检测到 LobeChat 1.x 数据库。请先备份并按 README 在独立实例迁移，禁止直接升级。' >&2
    exit 1
fi
# Serialize initialization; never rotate keys during concurrent install/upgrade operations.
LOCK_DIR="$APP_DIR/.secrets-init.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    echo 'LobeHub initialization is already running. If interrupted, check before removing .secrets-init.lock.' >&2
    exit 1
fi
trap 'rmdir "$LOCK_DIR"' EXIT

if command -v node >/dev/null 2>&1 && node -e 'if (Number(process.versions.node.split(".")[0]) < 16) process.exit(1)'; then
    node "$APP_DIR/generate-secrets.cjs" --init "$APP_DIR"
else
    # No host Node.js dependency: reuse the main image's Node.js, without starting LobeHub.
    IMAGE=$(awk '$1 == "image:" {print $2; exit}' "$APP_DIR/docker-compose.yml")
    docker run --rm --network none --user 0:0 --entrypoint /bin/node \
        --mount "type=bind,source=$APP_DIR,target=/deployment" \
        "$IMAGE" /deployment/generate-secrets.cjs --init /deployment
fi

mkdir -p "$APP_DIR/data/rustfs"
# The official RustFS image runs as UID/GID 10001.
chown 10001:10001 "$APP_DIR/data/rustfs"
chmod 750 "$APP_DIR/data/rustfs"
