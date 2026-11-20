# LobeHub（原 LobeChat 服务端数据库版）

[LobeHub](https://github.com/lobehub/lobehub) 是开源 AI 智能体协作平台，支持多模型对话、知识库、多模态与服务端数据同步。本应用保留键名 `lobe-chat-data`，新版配置按上游 **v2.3.4** 的部署文件核对。

## 版本与升级警告

| 目录 | 用途 |
| --- | --- |
| `2.3.4` | 推荐用于新安装，主镜像固定为 `lobehub/lobehub:2.3.4` |
| `latest` | 主镜像为 `lobehub/lobehub:latest`，可能随上游出现破坏性变化 |
| `1.143.3` | 原 LobeChat + Casdoor + MinIO 配置，保留供旧部署参考，不代表仍受维护 |

**1.x 不能通过“重建”直接无损升级到本包的 2.x。** 新版不再使用 `lobe-chat-database`、NextAuth 或内置 Casdoor，且 PostgreSQL 镜像、存储布局、认证模型均有变化。已关闭商店的跨版本升级标记；旧 `latest` 用户也必须先完成下方迁移，不要直接拉取并重建新版配置。初始化/升级脚本检测到旧 `./data/PG_VERSION` 会拒绝继续。

## 新安装

建议至少 2 核 / 4 GB 内存 / 20 GB 磁盘；生产环境建议 4 核 / 8 GB 以上。

### 1. 生成本实例专用密钥

在安装前，从所选版本目录运行（需要 Docker，可在另一台可信设备运行）：

```bash
cd apps/lobe-chat-data/2.3.4
# 仅运行密钥生成器，不启动应用、不连接数据库。
docker run --rm -i --entrypoint /bin/node lobehub/lobehub:2.3.4 - < generate-secrets.cjs
# 本机有 Node.js 时也可以：node generate-secrets.cjs
```

将输出的七项值分别填入 1Panel 安装表单的同名字段：数据库密码、RustFS 密钥、`KEY_VAULTS_SECRET`、`AUTH_SECRET`、`GATEWAY_SERVICE_TOKEN`、`JWKS_KEY` 和 `JWKS_PUBLIC_KEY`。只粘贴等号右侧的值；两个 JWKS 字段必须是配对的单行 JSON，不加外层引号。

每个实例都应重新生成。生成器不会修改已有配置。**妥善备份这些值，不要把密钥输出提交到 Git、发送到公共日志或在重建时重新生成。** 丢失/更换 `KEY_VAULTS_SECRET` 会使已有加密数据不可读。数据库密码建议使用生成器提供的十六进制值，避免连接 URI 中的特殊字符问题。

### 2. 设置地址和端口

将所有 `Your-IP` 改为浏览器实际可访问的 IP/域名，不要填容器名或 `localhost`（除非浏览器就在服务器上）。更改端口后必须同步更改对应地址。

| 字段 | 默认端口 | 说明 |
| --- | --- | --- |
| `PANEL_APP_PORT_HTTP` / `APP_URL` | 3210 | 应用地址，不要以 `/` 结尾 |
| `PANEL_APP_PORT_S3` / `S3_ENDPOINT` | 9000 | 浏览器直传和下载使用的 S3 地址 |
| `PANEL_APP_PORT_ADMIN` | 9001 | RustFS 控制台，仅允许可信网络访问 |
| `PANEL_APP_PORT_API` / `AGENT_GATEWAY_URL` | 8787 | Agent 网关，填写 HTTP/HTTPS 地址，代理必须支持 WebSocket |
| `PANEL_APP_PORT_PROXY` / `DEVICE_GATEWAY_PUBLIC_URL` | 8788 | 设备网关；外部地址可留空，由 CLI 显式指定 |

域名部署应同时反代应用、S3 和 Agent 网关；应用使用 HTTPS 时，S3/网关也应使用 HTTPS，避免混合内容拦截。Agent 网关反代开启 WebSocket 升级和长读取超时。设备网关供 `lh connect --gateway <地址>` 使用，需要时单独反代并允许 WebSocket。

`INTERNAL_APP_URL=http://localhost:3210` 和 `S3_INTERNAL_ENDPOINT=http://rustfs:9000` 已配置，应用自身及服务端存储请求不绕行公网。PostgreSQL、Redis 和 SearXNG 不发布宿主机端口，应用接入外部 `1panel-network`，依赖服务位于本实例的独立网络。

### 3. 登录与访问控制

新版默认使用 **Better Auth 邮箱密码注册/登录，没有预置账号或默认密码，也不需要进入 Casdoor 设置回调**。建议安装时填写 `AUTH_ALLOWED_EMAILS`（英文逗号分隔）；留空允许所有人注册/登录，该白名单不是关闭注册的开关。公网部署前务必配置访问控制。

RustFS 控制台地址为 `http://服务器IP:9001`，账号为安装时填写的 `RUSTFS_ACCESS_KEY`（默认 `admin`），密码为 `RUSTFS_SECRET_KEY`。不要向公网开放管理端口，注意 Docker 发布端口的实际防火墙规则。

需要邮箱验证、找回密码、SSO 或服务端模型密钥时，按[认证配置](https://lobehub.com/zh/docs/self-hosting/environment-variables/auth)与[环境变量文档](https://lobehub.com/zh/docs/self-hosting/environment-variables)在应用 Compose 的 `lobe.environment` 中显式补充。邮箱验证/重置密码需要配置邮件服务。本包不将整份 `.env` 注入依赖服务，尤其不会向网关传递 JWKS 私钥。

## 组件、数据与备份

- PostgreSQL：`paradedb/paradedb:latest-pg17`，提供 `pgvector` / `pg_search`，数据在 `./data/postgresql`。
- Redis 7：缓存及服务端状态，开启 AOF，数据在 `./data/redis`。
- RustFS：S3 对象存储，数据在 `./data/rustfs`，初始化脚本设置 UID/GID `10001` 的目录权限。
- `rustfs-init`：一次性创建固定桶 `lobe`、设置匿名对象读取策略与仅允许 `APP_URL` 的浏览器上传 CORS。成功后显示“已退出”是正常行为，故使用 `restart: no`。**桶内对象允许持有 URL 的人读取，切勿当作私密文件库。**
- SearXNG：提供联网搜索；配置在 `./data/searxng-settings.yml`。
- Gateway `0.5.0`：提供 Agent 和设备网关；运行中状态在内存，重启会中断任务。

固定版本目录只固定主应用镜像；数据库、RustFS、SearXNG 等辅助镜像仍遵循上游滚动标签，拉取更新前也应备份。未默认附加 Elasticsearch，使用 PostgreSQL `pg_search` 全文搜索。

在已安装应用的 Compose 目录备份数据库：

```bash
docker compose exec -T postgresql sh -c 'pg_dump -U postgres "$POSTGRES_DB"' > lobehub.sql
```

同时备份安装参数/`.env`（含全部密钥）、Compose 和整个 `./data/`。对 PostgreSQL/Redis 数据目录做文件级备份应先停止服务或使用一致性快照。恢复数据库、文件和密钥必须配套；不要通过删除数据库目录来解决迁移错误。

修改 `APP_URL` 后，在应用目录重新执行 `docker compose run --rm rustfs-init` 以刷新存储桶 CORS。手动使用 Compose 安装时，先执行 `bash scripts/init.sh` 准备 RustFS 目录权限；1Panel 安装时自动执行该脚本。

## 从旧 1.x 迁移

1. 暂停旧实例写入，备份旧 `.env`、Compose、完整 PostgreSQL（包括 Casdoor）、`./data` 和 `./s3_data`。保留原 `KEY_VAULTS_SECRET`；仓库旧包中该值是公开固定值，不要照搬到新安装。
2. **在独立目录/端口部署 2.x 测试实例**。不要将旧 `./data` 直接挂载到新 `./data/postgresql`，也不要让两个实例同时读写同一个 PostgreSQL 数据目录。新库需要 `pg_search`，先在测试环境验证逻辑备份恢复和启动迁移。
3. 按官方 [2.0 破坏性变更](https://lobehub.com/zh/docs/self-hosting/migration/v2/breaking-changes) 和 [NextAuth → Better Auth](https://lobehub.com/zh/docs/self-hosting/migration/v2/auth/nextauth-to-betterauth) 指南迁移认证。恢复旧数据时必须保留原数据加密密钥。若需保留原用户与聊天归属，不能只开启新邮箱注册：需按官方流程迁移 SSO 关联，并显式配置原 Casdoor 提供商。
4. 原 Casdoor **不要直接删除**。先确保用户都有有效邮箱；Better Auth 的 Casdoor 配置和回调与旧 NextAuth 不同，按[新版 Casdoor 文档](https://lobehub.com/zh/docs/self-hosting/auth/providers/casdoor)配置并验证。新版包本身不再打包 Casdoor。
5. MinIO 文件不会自动出现在 RustFS。使用 S3 客户端同步原桶对象并保留对象键，检查文件引用/公开地址；**不要直接复制 MinIO 底层存储目录给 RustFS**。必要时先沿用原 MinIO，手动调整新版 Compose 的 S3 环境变量和依赖关系。
6. 验证用户、历史聊天、知识库、文件上传/下载和网关后再切换流量。回滚需要恢复配套的旧数据库备份与原配置，不能仅切回旧镜像。

本包不自动执行破坏性数据库、认证或对象存储迁移。

## 上游参考

- [v2.3.4 部署 Compose](https://github.com/lobehub/lobehub/blob/v2.3.4/docker-compose/deploy/docker-compose.yml)
- [Docker Compose 部署说明](https://lobehub.com/zh/docs/self-hosting/platform/docker-compose)
- [LobeHub 项目](https://github.com/lobehub/lobehub)
