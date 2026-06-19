#!/usr/bin/env bash

# =============================================================================
# Icon Downloader - 从多个图标源下载应用图标
# 支持的源：dashboardicons、simpleicons、selfh.st
# =============================================================================

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 路径配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 图标源配置
DASHBOARD_ICONS="https://dashboardicons.com/icons"
SIMPLE_ICONS="https://cdn.simpleicons.org"
SELFHST_ICONS="https://selfh.st/icons"

# 默认输出尺寸
DEFAULT_SIZE=200
MODE="auto"
CACHE_DIR="${ICON_CACHE_DIR:-${SCRIPT_DIR}/../.cache/icons}"
ICON_URL=""
CONNECT_TIMEOUT="${ICON_CONNECT_TIMEOUT:-3}"
MAX_TIME="${ICON_MAX_TIME:-8}"
RETRY="${ICON_RETRY:-1}"

# 打印帮助
print_help() {
  cat << EOF
${BLUE}Icon Downloader${NC} - 从多个图标源下载应用图标

${YELLOW}用法:${NC}
  $0 [选项] <应用名称> [输出文件] [尺寸]

${YELLOW}参数:${NC}
  应用名称   - 应用的名称（如 alist, nginx, redis）
  输出文件   - 图标保存路径（默认: ./logo.png）
  尺寸       - 图标尺寸（默认: 200x200）

${YELLOW}选项:${NC}
  --mode auto|required|skip|cache-only
             auto: 优先缓存，缺失时尝试下载，未找到不创建占位图
             required: 找不到图标时返回失败
             skip: 跳过图标下载
             cache-only: 只使用缓存，不访问网络
  --cache-dir <目录>
             图标缓存目录（默认: skills/.cache/icons）
  --url <URL> 从指定 URL 下载图标

${YELLOW}图标源优先级:${NC}
  1. Dashboard Icons (dashboardicons.com)
  2. Simple Icons (simpleicons.org)
  3. selfh.st Icons (selfh.st)

${YELLOW}示例:${NC}
  $0 alist ./logo.png 200
  $0 nginx /tmp/nginx-icon.png
  $0 redis
EOF
}

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

normalize_name() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' _' '--' | tr -cd 'a-z0-9.-'
}

valid_icon_file() {
  local file="$1"
  [[ -s "$file" ]] || return 1
  if head -c 512 "$file" | grep -qiE '<!doctype|<html|<Error>|AccessDenied'; then
    return 1
  fi
  return 0
}

copy_from_cache() {
  local app_name="$1"
  local output="$2"
  local name_lower
  name_lower=$(normalize_name "$app_name")

  local ext cached
  for ext in png svg webp jpg jpeg; do
    cached="${CACHE_DIR}/${name_lower}.${ext}"
    if valid_icon_file "$cached"; then
      mkdir -p "$(dirname "$output")"
      cp "$cached" "$output"
      log_info "✓ 使用缓存图标: $cached"
      return 0
    fi
  done
  return 1
}

save_to_cache() {
  local app_name="$1"
  local file="$2"
  local name_lower
  name_lower=$(normalize_name "$app_name")

  mkdir -p "$CACHE_DIR"
  cp "$file" "${CACHE_DIR}/${name_lower}.png" 2>/dev/null || true
}

# 下载并调整图标尺寸
download_and_resize() {
  local url="$1"
  local output="$2"
  local size="$3"
  local tmp
  tmp="$(mktemp)"

  if curl -fsSL --connect-timeout "$CONNECT_TIMEOUT" --max-time "$MAX_TIME" --retry "$RETRY" -o "$tmp" "$url" 2>/dev/null && valid_icon_file "$tmp"; then
    mkdir -p "$(dirname "$output")"
    mv "$tmp" "$output"
    # 检查是否安装了 ImageMagick 或 sips (macOS)
    if command -v convert &>/dev/null; then
      convert "$output" -resize "${size}x${size}" "$output" 2>/dev/null || true
    elif command -v sips &>/dev/null; then
      sips -z "$size" "$size" "$output" &>/dev/null || true
    fi
    return 0
  fi
  rm -f "$tmp"
  return 1
}

# 尝试从各图标源下载
try_download_icon() {
  local app_name="$1"
  local output="$2"
  local size="$3"

  local name_lower
  name_lower=$(normalize_name "$app_name")

  log_info "尝试下载图标: $app_name"

  if [[ -n "$ICON_URL" ]]; then
    log_info "尝试指定图标 URL..."
    if download_and_resize "$ICON_URL" "$output" "$size"; then
      save_to_cache "$app_name" "$output"
      log_info "✓ 从指定 URL 下载成功"
      return 0
    fi
    return 1
  fi

  # 1. Dashboard Icons
  log_info "尝试 Dashboard Icons..."
  local dashboard_url="${DASHBOARD_ICONS}/${name_lower}.png"
  if download_and_resize "$dashboard_url" "$output" "$size"; then
    save_to_cache "$app_name" "$output"
    log_info "✓ 从 Dashboard Icons 下载成功"
    return 0
  fi

  # 尝试带 -dark 后缀
  if download_and_resize "${DASHBOARD_ICONS}/${name_lower}-dark.png" "$output" "$size"; then
    save_to_cache "$app_name" "$output"
    log_info "✓ 从 Dashboard Icons (dark) 下载成功"
    return 0
  fi

  # 2. Simple Icons
  log_info "尝试 Simple Icons..."
  local simple_url="${SIMPLE_ICONS}/${name_lower}"
  if download_and_resize "$simple_url" "$output" "$size"; then
    save_to_cache "$app_name" "$output"
    log_info "✓ 从 Simple Icons 下载成功"
    return 0
  fi

  # Simple Icons 也支持 SVG
  if curl -fsSL --connect-timeout "$CONNECT_TIMEOUT" --max-time "$MAX_TIME" --retry "$RETRY" -o "${output%.png}.svg" "${SIMPLE_ICONS}/${name_lower}" 2>/dev/null && valid_icon_file "${output%.png}.svg"; then
    log_info "✓ 从 Simple Icons 下载 SVG 成功"
    # 如果有 SVG，尝试转换
    if command -v convert &>/dev/null; then
      convert "${output%.png}.svg" -resize "${size}x${size}" "$output" 2>/dev/null || true
      if [[ -s "$output" ]]; then
        rm -f "${output%.png}.svg"
        save_to_cache "$app_name" "$output"
        return 0
      fi
    fi
  fi

  # 3. selfh.st Icons
  log_info "尝试 selfh.st Icons..."
  local selfhst_url="${SELFHST_ICONS}/${name_lower}.png"
  if download_and_resize "$selfhst_url" "$output" "$size"; then
    save_to_cache "$app_name" "$output"
    log_info "✓ 从 selfh.st Icons 下载成功"
    return 0
  fi

  return 1
}

parse_args() {
  POSITIONAL=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --mode)
        MODE="${2:-}"
        shift 2
        ;;
      --cache-dir)
        CACHE_DIR="${2:-}"
        shift 2
        ;;
      --url)
        ICON_URL="${2:-}"
        shift 2
        ;;
      -h|--help)
        print_help
        exit 0
        ;;
      --)
        shift
        POSITIONAL+=("$@")
        break
        ;;
      -*)
        log_error "未知选项: $1"
        exit 2
        ;;
      *)
        POSITIONAL+=("$1")
        shift
        ;;
    esac
  done

  case "$MODE" in
    auto|required|skip|cache-only) ;;
    *)
      log_error "无效模式: $MODE"
      exit 2
      ;;
  esac
}

# 主函数
main() {
  parse_args "$@"

  local app_name="${POSITIONAL[0]:-}"
  local output="${POSITIONAL[1]:-./logo.png}"
  local size="${POSITIONAL[2]:-$DEFAULT_SIZE}"

  # 参数检查
  if [[ -z "$app_name" ]] || [[ "$app_name" == "-h" ]] || [[ "$app_name" == "--help" ]]; then
    print_help
    exit 0
  fi

  if [[ "$MODE" == "skip" ]]; then
    log_info "跳过图标下载: $app_name"
    exit 0
  fi

  if copy_from_cache "$app_name" "$output"; then
    exit 0
  fi

  if [[ "$MODE" == "cache-only" ]]; then
    log_warn "缓存中未找到图标: $app_name"
    exit 0
  fi

  # 尝试下载
  if try_download_icon "$app_name" "$output" "$size"; then
    log_info "${GREEN}✓ 图标下载完成: $output${NC}"
    exit 0
  fi

  rm -f "$output" "${output%.png}.svg"
  log_warn "未找到图标，未创建占位图: $output"
  log_info "请手动从以下网站下载合适的图标:"
  echo "  - https://dashboardicons.com/icons?q=${app_name}"
  echo "  - https://simpleicons.org/?q=${app_name}"
  echo "  - https://selfh.st/icons/"

  if [[ "$MODE" == "required" ]]; then
    exit 1
  fi
}

# 执行主函数
main "$@"
