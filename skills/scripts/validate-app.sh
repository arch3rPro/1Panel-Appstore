#!/usr/bin/env bash

# =============================================================================
# 1Panel App Validator - 验证生成的配置是否符合规范
# 用法：./validate-app.sh <app-directory>
# =============================================================================

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 计数器
ERRORS=0
WARNINGS=0

# 打印帮助
print_help() {
  cat << EOF
${BLUE}1Panel App Validator${NC} - 验证应用配置是否符合规范

${YELLOW}用法:${NC}
  $0 <app-directory>

${YELLOW}检查项目:${NC}
  - 目录结构完整性
  - data.yml 格式正确性
  - docker-compose.yml 变量使用
  - logo.png 是否存在
  - README 文件是否存在

${YELLOW}示例:${NC}
  $0 ./apps/alist
EOF
}

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; ((WARNINGS+=1)); }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; ((ERRORS+=1)); }

has_yq() {
  command -v yq >/dev/null 2>&1
}

yq_read() {
  local file="$1"
  local expr="$2"
  if has_yq; then
    yq -r "$expr" "$file" 2>/dev/null || true
  fi
}

# 检查目录结构
check_directory_structure() {
  local app_dir="$1"
  local app_name
  app_name=$(basename "$app_dir")

  log_info "检查目录结构: $app_name"

  # 检查必需文件
  if [[ ! -f "$app_dir/data.yml" ]]; then
    log_error "缺少顶层 data.yml"
  fi

  if [[ ! -f "$app_dir/logo.png" ]]; then
    log_error "缺少 logo.png"
  fi

  if [[ ! -f "$app_dir/README.md" ]]; then
    log_warn "缺少 README.md（推荐）"
  fi

  # 查找版本目录
  local version_dirs
  version_dirs=$(find "$app_dir" -mindepth 1 -maxdepth 1 -type d \( -name "v*" -o -name "latest" -o -name "[0-9]*" \) 2>/dev/null || echo "")

  if [[ -z "$version_dirs" ]]; then
    log_error "未找到版本目录（如 1.0.0/, v1.0.0/, latest/）"
    return 0
  fi

  # 检查每个版本目录
  for version_dir in $version_dirs; do
    log_info "检查版本目录: $(basename "$version_dir")"

    if [[ ! -f "$version_dir/data.yml" ]]; then
      log_error "版本目录缺少 data.yml: $version_dir"
    fi

    if [[ ! -f "$version_dir/docker-compose.yml" ]]; then
      log_error "版本目录缺少 docker-compose.yml: $version_dir"
    fi
  done
}

# 验证顶层 data.yml
validate_top_data_yml() {
  local data_file="$1"
  local app_dir app_name
  app_dir="$(dirname "$data_file")"
  app_name="$(basename "$app_dir")"

  log_info "验证顶层 data.yml"

  if [[ ! -f "$data_file" ]]; then
    return 1
  fi

  # 检查必需字段
  local required_fields=("name" "title" "description")
  for field in "${required_fields[@]}"; do
    if ! grep -q "^${field}:" "$data_file"; then
      log_error "data.yml 缺少必需字段: $field"
    fi
  done

  # 检查 additionalProperties
  if ! grep -q "additionalProperties:" "$data_file"; then
    log_error "data.yml 缺少 additionalProperties"
  fi

  # 检查 key
  if ! grep -q "key:" "$data_file"; then
    log_error "data.yml 缺少 additionalProperties.key"
  fi

  if has_yq; then
    local key
    key=$(yq_read "$data_file" '.additionalProperties.key // ""')
    if [[ -n "$key" && "$key" != "$app_name" ]]; then
      log_error "additionalProperties.key 必须与应用目录名一致: key=$key dir=$app_name"
    fi
  fi

  # 检查 tags
  if ! grep -q "tags:" "$data_file"; then
    log_warn "data.yml 缺少 tags（推荐）"
  fi

  # 检查 architectures
  if ! grep -q "architectures:" "$data_file"; then
    log_warn "data.yml 缺少 architectures（推荐）"
  fi
}

# 验证版本 data.yml
validate_version_data_yml() {
  local data_file="$1"

  log_info "验证版本 data.yml"

  if [[ ! -f "$data_file" ]]; then
    return 1
  fi

  # 检查 formFields
  if ! grep -q "formFields:" "$data_file"; then
    log_warn "版本 data.yml 缺少 formFields（如果无可配置参数则忽略）"
    return 0
  fi

  # 检查每个参数是否有 envKey
  local param_count
  param_count=$(grep -c "envKey:" "$data_file" 2>/dev/null || echo "0")

  if [[ "$param_count" -eq 0 ]]; then
    log_warn "formFields 中未找到 envKey 定义"
  else
    log_info "找到 $param_count 个可配置参数"
  fi
}

extract_form_env_keys() {
  local data_file="$1"

  if [[ ! -f "$data_file" ]]; then
    return 0
  fi

  if has_yq; then
    yq -r '.additionalProperties.formFields[]?.envKey // empty' "$data_file" 2>/dev/null || true
  else
    grep -oE 'envKey:[[:space:]]*PANEL_APP_PORT_[A-Z0-9_]+' "$data_file" | awk '{print $2}' || true
  fi
}

extract_compose_port_vars() {
  local compose_file="$1"
  grep -oE '\$\{PANEL_APP_PORT_[A-Z0-9_]+\}' "$compose_file" | sed -E 's/^\$\{//; s/\}$//' | sort -u || true
}

validate_port_variables() {
  local data_file="$1"
  local compose_file="$2"
  local defined used var

  defined="$(extract_form_env_keys "$data_file" | sort -u)"
  used="$(extract_compose_port_vars "$compose_file")"

  while IFS= read -r var; do
    [[ -z "$var" ]] && continue
    if ! grep -qx "$var" <<< "$defined"; then
      log_error "端口变量 ${var} 在 docker-compose.yml 中使用，但未在版本 data.yml 中定义"
    fi
  done <<< "$used"
}

validate_image_tags() {
  local version_dir="$1"
  local compose_file="$2"
  local version image tag matched_version=false

  version="$(basename "$version_dir")"
  while IFS= read -r image; do
    [[ -z "$image" || "$image" == "null" ]] && continue

    if [[ "$image" =~ @sha256: ]]; then
      continue
    fi

    if [[ "$image" =~ :([^/:]+)$ ]]; then
      tag="${BASH_REMATCH[1]}"
    else
      tag="latest"
    fi

    if [[ "$version" == "latest" && "$tag" != "latest" ]]; then
      log_error "latest 目录中的镜像必须使用 latest tag: $image"
    fi

    if [[ "$version" != "latest" && "$tag" == "$version" ]]; then
      matched_version=true
    fi
  done < <(grep -E '^[[:space:]]*image:[[:space:]]*' "$compose_file" | sed -E 's/^[[:space:]]*image:[[:space:]]*"?([^"]*)"?/\1/' || true)

  if [[ "$version" != "latest" && "$matched_version" != "true" ]]; then
    log_warn "版本目录 ${version} 未检测到与目录名一致的镜像 tag，请确认是否为多服务或特殊版本"
  fi
}

validate_logo_file() {
  local logo_file="$1"

  if [[ ! -f "$logo_file" ]]; then
    return 0
  fi

  if head -c 512 "$logo_file" | grep -qiE '<!doctype|<html|<Error>|AccessDenied'; then
    log_error "logo.png 看起来不是有效图片，可能是下载失败返回的 HTML/XML"
  fi
}

# 验证 docker-compose.yml
validate_docker_compose() {
  local compose_file="$1"

  log_info "验证 docker-compose.yml"

  if [[ ! -f "$compose_file" ]]; then
    return 1
  fi

  # 检查 container_name 使用变量
  if grep -q "container_name:" "$compose_file"; then
    if ! grep -q 'container_name:.*\${CONTAINER_NAME}' "$compose_file"; then
      log_error "container_name 必须使用 \${CONTAINER_NAME} 变量"
    fi
  fi

  # 检查 networks
  if ! grep -q "1panel-network:" "$compose_file"; then
    log_error "docker-compose.yml 缺少 1panel-network"
  fi

  if ! grep -q "external: true" "$compose_file"; then
    log_error "1panel-network 必须设置为 external: true"
  fi

  # 检查 restart
  if ! grep -q "restart: always" "$compose_file"; then
    log_warn "建议设置 restart: always"
  fi

  # 检查 labels
  if ! grep -q 'createdBy: "Apps"' "$compose_file"; then
    log_warn "建议添加 labels: createdBy: \"Apps\""
  fi

  # 检查端口映射使用变量
  if grep -q "ports:" "$compose_file"; then
    if ! grep -q 'PANEL_APP_PORT_' "$compose_file"; then
      log_warn "端口映射建议使用 PANEL_APP_PORT_* 变量"
    fi
  fi

  # 检查数据卷路径
  if grep -q "volumes:" "$compose_file"; then
    if grep -qE '^\s+- /[a-zA-Z]' "$compose_file"; then
      log_warn "检测到绝对路径的数据卷，建议使用 ./data/ 相对路径"
    fi
  fi
}

# 主函数
main() {
  local app_dir="${1:-}"

  # 参数检查
  if [[ -z "$app_dir" ]] || [[ "$app_dir" == "-h" ]] || [[ "$app_dir" == "--help" ]]; then
    print_help
    exit 0
  fi

  if [[ ! -d "$app_dir" ]]; then
    log_error "目录不存在: $app_dir"
    exit 1
  fi

  echo ""
  echo -e "${BLUE}=== 1Panel App Validator ===${NC}"
  echo ""

  # 执行检查
  check_directory_structure "$app_dir"
  validate_top_data_yml "$app_dir/data.yml"
  validate_logo_file "$app_dir/logo.png"

  # 查找并验证版本目录
  local version_dirs
  version_dirs=$(find "$app_dir" -mindepth 1 -maxdepth 1 -type d \( -name "v*" -o -name "latest" -o -name "[0-9]*" \) 2>/dev/null || echo "")

  for version_dir in $version_dirs; do
    validate_version_data_yml "$version_dir/data.yml"
    validate_docker_compose "$version_dir/docker-compose.yml"
    validate_port_variables "$version_dir/data.yml" "$version_dir/docker-compose.yml"
    validate_image_tags "$version_dir" "$version_dir/docker-compose.yml"
  done

  # 输出结果
  echo ""
  echo -e "${BLUE}=== 验证结果 ===${NC}"
  echo ""

  if [[ $ERRORS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}✓ 验证通过！未发现问题。${NC}"
    exit 0
  elif [[ $ERRORS -eq 0 ]]; then
    echo -e "${YELLOW}⚠ 验证通过，但有 $WARNINGS 个警告。${NC}"
    exit 0
  else
    echo -e "${RED}✗ 验证失败！发现 $ERRORS 个错误和 $WARNINGS 个警告。${NC}"
    exit 1
  fi
}

# 执行主函数
main "$@"
