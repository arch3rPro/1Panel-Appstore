# LobeHub

[LobeHub](https://github.com/lobehub/lobehub) 是开源 AI 智能体协作平台，支持多模型对话、知识库、多模态交互和工具调用，数据保存在服务端，便于跨设备使用。

## 主要功能

- 支持 OpenAI、Claude、Gemini、Ollama 等模型服务。
- 支持文件上传、知识库检索及图片、语音等多模态功能。
- 支持联网搜索、MCP 工具和智能体协作。
- 通过 Agent 网关执行服务端任务，通过设备网关连接桌面端和 CLI 设备。
- 内置邮箱密码注册与登录，可配置邮箱白名单和第三方登录。

## 部署要求

- 支持 `amd64`、`arm64` 架构。
- 建议至少 2 核 CPU、4 GB 内存、20 GB 可用磁盘；日常使用建议 4 核、8 GB 内存。
- 需要浏览器和接入设备能够访问应用、S3、Agent 网关及设备网关地址。

本应用包含 LobeHub、PostgreSQL、Redis、RustFS、SearXNG 和网关服务。数据库、Redis 和搜索服务不对外开放端口。

## 安装配置

在 1Panel 应用商店安装时填写以下地址，将 `Your-IP` 替换为服务器的实际 IP 或域名。端口可以保留默认值；修改端口后应同步修改对应地址。

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| 应用地址 | `http://Your-IP:3210` | 必须与浏览器实际访问的协议、主机和端口一致，不要填写路径或结尾的 `/` |
| S3 地址 | `http://Your-IP:9000` | 浏览器上传、下载文件使用的对象存储地址 |
| Agent 网关地址 | `http://Your-IP:8787` | 服务端智能体执行与消息推送 |
| 设备网关地址 | `http://Your-IP:8788` | 桌面端和 CLI 设备接入 |
| RustFS 管理端口 | `9001` | 对象存储控制台，仅向可信网络开放 |
| 注册邮箱白名单 | 留空 | 留空允许所有邮箱注册；支持完整邮箱或域名，多个条目使用英文逗号分隔 |

数据库密码、存储密码和认证密钥由安装脚本自动生成，无需手动填写。初始化结束后，`rustfs-init` 容器显示“已退出（0）”属于正常现象。

### 域名与 HTTPS

生产环境建议使用 HTTPS，并为以下四个服务分别配置反向代理：

| 服务 | 示例地址 | 默认目标端口 |
| --- | --- | --- |
| LobeHub | `https://lobe.example.com` | `3210` |
| S3 | `https://s3.example.com` | `9000` |
| Agent 网关 | `https://agent.example.com` | `8787` |
| 设备网关 | `https://device.example.com` | `8788` |

- 将安装参数中的地址改为对应的 HTTPS 地址。
- 应用反向代理应正确传递 `Host`、`X-Forwarded-Host` 和 `X-Forwarded-Proto`。
- 两个网关均需开启 WebSocket 升级，并适当延长读取超时。
- HTTPS 应用应配套使用 HTTPS 的 S3 和网关地址，避免浏览器拦截混合内容。

## 首次使用

1. 等待应用完成数据库初始化并启动。
2. 使用安装时配置的**应用地址**打开页面，选择注册。
3. 输入有效邮箱，设置 **8～64 位密码**，按页面提示完成注册。
4. 登录后在设置中添加模型服务及 API Key。

应用没有预置账号。默认启用邮箱密码注册，不要求邮箱验证，也不需要配置 SMTP。启用邮箱验证、邮件找回密码等功能时，再按[认证文档](https://lobehub.com/zh/docs/self-hosting/environment-variables/auth)配置邮件服务。

如果填写了白名单，注册邮箱必须与其中的邮箱或域名匹配。例如 `owner@example.com,company.com` 允许指定邮箱和 `company.com` 域名的邮箱注册。

### 连接设备

在设备上安装 LobeHub CLI 后，使用配置的设备网关地址连接：

```bash
lh connect --gateway https://device.example.com
```

### RustFS 控制台

默认通过 `http://服务器IP:9001` 访问，账号为 `admin`。密码保存在已安装应用目录的 `data/secrets/state.json` 文件中，对应 `RUSTFS_SECRET_KEY` 字段。请仅在可信终端查看，勿公开凭据或将管理端口暴露到公网。

## 数据与备份

| 路径 | 内容 |
| --- | --- |
| `data/postgresql/` | 用户、对话、知识库等数据库数据 |
| `data/rustfs/` | 上传的文件及对象存储数据 |
| `data/redis/` | Redis 持久化数据 |
| `data/secrets/` | 数据库密码、认证与加密密钥及各服务凭据 |
| `data/searxng-settings.yml` | 联网搜索配置 |

**务必将 `data/secrets/` 与业务数据一起备份。** 重建和升级会复用已有密钥；丢失或更换数据加密密钥后，原有加密数据将无法读取。

在已安装应用目录执行数据库备份：

```bash
docker compose exec -T postgresql sh -c 'pg_dump -U postgres "$POSTGRES_DB"' > lobehub.sql
```

同时保存 Compose、`.env` 和整个 `data/` 目录。直接复制数据库文件前，应先停止服务或使用一致性快照。更新镜像前先备份，恢复时使用配套的数据库、文件和密钥。

对象存储桶允许通过对象 URL 读取文件，不应作为私密文件库使用。网关的运行中状态保存在内存中，重启网关会中断正在执行的任务。

## 常见问题

### 无法注册或登录

- 确认浏览器访问地址与安装参数 `APP_URL` 完全一致，包括 HTTP/HTTPS、域名/IP 和端口；不要保留 `Your-IP`。
- 检查注册邮箱白名单是否包含当前邮箱或所属域名，分隔符应为英文逗号。
- 密码应为 8～64 位。
- 使用反向代理时，检查转发的主机名和协议是否正确。修改地址后，重新创建应用容器，并清除该站点旧 Cookie 后重试。
- 如仍失败，查看浏览器开发者工具中 `/api/auth/sign-up/email` 请求的状态码和响应，以及 `docker compose logs --tail=100 lobe`。分享日志前请删除密码、Token、Cookie 等敏感信息。

### 日志提示 Redis `NOAUTH Authentication required`

这表示当前 Redis 连接需要认证，但应用没有提供匹配的凭据。本包使用私有网络内的专用 Redis，不应连接共享网络上其他应用的 Redis。`REDIS_URL` 应为 `redis://${CONTAINER_NAME}-redis:6379`，不要使用容易重名的 `redis://redis:6379`。

在已安装应用目录执行 `docker compose exec redis redis-cli ping`，本包默认应返回 `PONG`。如果专用 Redis 也返回 `NOAUTH`，应检查该服务是否被额外配置了密码，并为应用配置对应的 `REDIS_PASSWORD`；不要关闭其他 Redis 实例的认证。

### 文件上传失败

确认浏览器能够访问 `S3_ENDPOINT`，且与应用使用相容的 HTTP/HTTPS 协议。修改应用地址后，在已安装应用目录重新配置上传 CORS：

```bash
docker compose run --rm rustfs-init
```

## 相关链接

- [项目仓库](https://github.com/lobehub/lobehub)
- [官方文档](https://lobehub.com/zh/docs)
- [Docker Compose 部署](https://lobehub.com/zh/docs/self-hosting/platform/docker-compose)
- [认证配置](https://lobehub.com/zh/docs/self-hosting/environment-variables/auth)
