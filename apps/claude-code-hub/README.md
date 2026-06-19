# Claude Code Hub

智能 AI API 代理中转服务平台，面向团队的多供应商统一接入、弹性调度与精细化运营中心。

## 功能特点

- 🤖 **智能负载均衡**：权重 + 优先级 + 分组调度，内置熔断保护与最多 3 次故障转移，保障请求稳定
- 🧩 **多供应商管理**：同时接入 Claude、Codex、Gemini CLI、OpenAI Compatible，自定义模型重定向与 HTTP/HTTPS/SOCKS 代理
- 🛡️ **限流与并发控制**：RPM、金额（5 小时/周/月）、并发 Session 多维限制，Redis Lua 脚本确保原子性与 Fail-Open 降级
- 📘 **自动化 OpenAPI 文档**：39 个 REST 端点由 Server Actions 自动生成 OpenAPI 3.1.0，Swagger + Scalar UI 双界面即刻试用
- 📊 **实时监控与统计**：仪表盘、活跃 Session、消耗排行榜、决策链记录、代理状态追踪，秒级掌控运行态势
- 💰 **价格表管理**：分页查询 + SQL 优化，支持搜索防抖、LiteLLM 同步，千级模型也能快速检索
- 🔁 **Session 管理**：5 分钟上下文缓存，记录决策链，避免频繁切换供应商并保留全链路审计
- 🔄 **OpenAI 兼容端点**：支持 `/v1/chat/completions`（OpenAI 兼容格式），工具调用与 reasoning 字段透传

## 使用说明

### 默认端口

- Web 界面: 23000

### 默认账号密码

- 管理员令牌: 请在部署时设置 `ADMIN_TOKEN` 环境变量（必须修改）

### 数据目录

应用数据存储在 `./data` 目录：

- PostgreSQL 数据: `./data/postgres`
- Redis 数据: `./data/redis`

### 环境变量说明

#### 必需配置

- `ADMIN_TOKEN`: 管理员登录令牌（必须修改）
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称

#### 可选配置

- `ENABLE_RATE_LIMIT`: 是否启用限流（默认：true）
- `SESSION_TTL`: 会话过期时间，单位秒（默认：300）
- `AUTO_MIGRATE`: 是否自动执行数据库迁移（默认：true）
- `ENABLE_SECURE_COOKIES`: 是否启用安全 Cookie（默认：false）
  - **重要**：如果使用 HTTP 部署（非 HTTPS），请保持为 `false`
  - 如果使用 HTTPS 部署，建议设置为 `true` 以提高安全性
  - 设置为 `true` 时，浏览器将拒绝在 HTTP 连接下设置 Cookie，导致无法登录

### 访问应用

部署成功后，可以通过以下地址访问：

- **管理后台**：`http://localhost:23000`（使用 `ADMIN_TOKEN` 登录）
- **API 文档（Scalar UI）**：`http://localhost:23000/api/actions/scalar`
- **API 文档（Swagger UI）**：`http://localhost:23000/api/actions/docs`

## 相关链接

- 官方网站: https://github.com/ding113/claude-code-hub
- GitHub: https://github.com/ding113/claude-code-hub
- 文档: https://github.com/ding113/claude-code-hub/blob/main/README.md

## 技术栈

- **框架**: Next.js 15 + Hono
- **数据库**: PostgreSQL 18
- **缓存**: Redis 7
- **运行时**: Node.js / Bun
- **语言**: TypeScript
