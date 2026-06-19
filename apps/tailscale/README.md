# Tailscale

最简单、最安全的 WireGuard 私有网络组网工具。Tailscale 让您能够轻松创建安全的 mesh 网络，将您的设备连接在一起，无论它们位于何处。

## 功能特点

- **基于 WireGuard**: 使用现代化的 WireGuard 协议，提供高性能和强安全性
- **自动 NAT 穿透**: 自动处理复杂的网络环境，实现设备间直连
- **零配置**: 无需手动配置，登录即可使用
- **端到端加密**: 所有通信都经过端到端加密
- **多平台支持**: 支持 Linux、Windows、macOS、iOS、Android 等平台
- **子网路由**: 可将整个子网路由到 Tailscale 网络
- **魔法 DNS**: 自动为设备分配易记的 DNS 名称
- **访问控制**: 精细的访问控制策略

## 使用说明

### 认证方式

Tailscale 支持两种认证方式：

#### 方式一：使用认证密钥（推荐）

1. 访问 [Tailscale 管理控制台](https://login.tailscale.com/admin/settings/keys)
2. 点击 "Generate auth key" 创建认证密钥
3. 复制生成的密钥，在部署时填写到 "Tailscale 认证密钥" 字段
4. 部署后自动完成认证，无需额外操作

**注意**：认证密钥有过期时间，请在生成后尽快使用。

#### 方式二：交互登录

1. 部署时留空 "Tailscale 认证密钥" 字段
2. 部署完成后，在 1Panel 容器列表中点击 "Tailscale" 容器的 "终端" 按钮
3. 在终端中执行以下命令：
   ```bash
   tailscale up
   ```
4. 命令会输出一个认证 URL，复制该 URL 到浏览器打开
5. 登录您的 Tailscale 账号并授权该设备
6. 认证成功后，容器会自动连接到 Tailscale 网络

### 部署参数说明

- **Tailscale 认证密钥**（可选）：从管理控制台获取的认证密钥，留空则使用交互登录
- **用户空间模式**: 
  - `false` (推荐): 使用内核网络模式，性能更好
  - `true`: 使用用户空间网络模式，兼容性更好
- **子网路由** (可选): 要广播的子网，如 `192.168.1.0/24,10.0.0.0/8`
- **接受 DNS**: 是否接受 Tailscale 的 DNS 配置
- **额外参数** (可选): tailscale up 命令的额外参数，如 `--accept-routes`

### 部署后操作

1. 部署完成后，访问 [Tailscale 管理控制台](https://login.tailscale.com/admin/machines) 查看设备状态
2. 在其他设备上安装 Tailscale 客户端并登录同一账号
3. 设备间可以通过 Tailscale IP 或魔法 DNS 名称互相访问

### 高级配置

#### 配置子网路由器

如果您希望将本地网络路由到 Tailscale：

1. 在 `子网路由` 参数中填写要广播的子网，如 `192.168.1.0/24`
2. 部署后在管理控制台批准该子网路由
3. 其他 Tailscale 设备即可访问该子网内的设备

#### 使用出口节点

将 Tailscale 配置为出口节点，让其他设备通过此设备访问互联网：

1. 在 `额外参数` 中添加 `--advertise-exit-node`
2. 部署后在管理控制台批准出口节点
3. 其他设备可以选择使用此出口节点

#### 仅首次认证

如果希望只在首次启动时使用认证密钥，后续启动使用已有状态：

- 设置环境变量 `TS_AUTH_ONCE=true`（需要在 docker-compose.yml 中手动添加）

### 数据目录

应用数据存储在 `./data/state` 目录，包含 Tailscale 的状态信息（认证状态、配置等）。该目录挂载到容器的 `/var/lib/tailscale`。

**重要提示**：请确保 `data/state` 目录有正确的读写权限，否则状态无法保存，导致每次重启都需要重新认证。

## 环境变量说明

- `TS_AUTHKEY`: Tailscale 认证密钥（可选，支持交互登录）
- `TS_USERSPACE`: 是否使用用户空间网络模式
- `TS_STATE_DIR`: 状态文件存储目录（固定为 /var/lib）
- `TS_ROUTES`: 要广播的子网路由
- `TS_ACCEPT_DNS`: 是否接受 Tailscale DNS 配置
- `TS_EXTRA_ARGS`: tailscale up 命令的额外参数
- `TS_AUTH_ONCE`: 是否仅在首次启动时认证（默认 false）

## 注意事项

- 需要 `privileged` 权限和 `NET_ADMIN`、`SYS_MODULE` 能力
- 使用 `host` 网络模式以直接管理网络接口
- 需要访问 `/dev/net/tun` 设备
- 首次运行时需要有效的认证密钥或进行交互登录
- 建议在防火墙中允许 UDP 41641 端口（WireGuard 默认端口）
- 容器重启策略固定为 `always`，由 1Panel 统一管理

## 相关链接

- 官方网站：https://tailscale.com
- GitHub: https://github.com/tailscale/tailscale
- 文档：https://tailscale.com/kb
- 管理控制台：https://login.tailscale.com/admin
- 下载客户端：https://tailscale.com/download
