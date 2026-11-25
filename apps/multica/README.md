# Multica

<div align="center">

把 issue 指派给 AI Agent 的自托管协作工作台。

[官网](https://multica.ai) · [文档](https://multica.ai/docs) · [自托管指南](https://github.com/multica-ai/multica/blob/main/SELF_HOSTING.md)

</div>

![](https://img.shields.io/badge/Copyright-arch3rPro-ff9800?style=flat&logo=github&logoColor=white)

---

## 这是什么

Multica 是一个工作空间：你在看板上创建 issue，把它指派给一个 AI Agent，就像指派给同事一样。Agent 领取任务、在 issue 里汇报进度、遇到阻塞时抛出来，做完交回给你评审。

Agent 并不跑在这个应用里。每个要用 Agent 的人在自己机器上安装 `multica` CLI 并启动 daemon，daemon 检测本机已装的 AI Agent CLI，向服务器注册，然后领任务执行。所以本应用只负责服务端：后端 API、Web 界面、数据库。

## 本应用包含什么

| 服务 | 说明 |
|---|---|
| `multica` | Next.js 前端，浏览器访问入口，同时把 `/api`、`/ws` 反代到后端 |
| `multica-backend` | Go 后端，REST API + WebSocket，启动时自动跑数据库迁移 |
| `postgres` | PostgreSQL 17 + pgvector，数据与上传文件之外的持久化 |

上传的附件落在 `./data/uploads`，数据库落在 `./data/postgres`。

## 安装后第一步：填对访问地址

安装表单里的**「访问地址」**（`APP_URL`）必须填你实际用来打开 Multica 的地址，例如：

```
http://192.168.1.10:3000
```

这一项不是装饰：

- 后端用它决定 session cookie 是否带 `Secure` 标志。填 `https://` 而实际是 http 访问，浏览器会丢弃 cookie，表现为登录后立刻又回到登录页。
- 后端用它做 WebSocket 的 Origin 白名单校验。地址填错，界面能打开、能登录，但看板实时更新和 Agent 状态会静默失效（`/ws` 返回 403）。

换域名或换 IP 之后，记得回到应用参数里同步修改这一项并重启。

## 登录

默认配置下没有固定验证码。两种方式：

**配了 SMTP（推荐）**：在安装参数里填 SMTP 服务器、端口、账号密码和发件邮箱，验证码会发到邮箱。

**没配 SMTP**：验证码由后端生成并打印到容器日志。用 SSH 在服务器上执行：

```bash
docker logs -f <容器名前缀>-backend 2>&1 | grep "Verification code"
```

登录页输入邮箱，日志里会出现 `/auth/send-code` 对应的六位验证码，填进去即可。

> 不要为了省事去设 `MULTICA_DEV_VERIFICATION_CODE`。固定在公网可达的实例上等于任何人知道你的邮箱就能登录。

## 每个人再配自己的 Agent

服务器装好之后，需要跑 Agent 的人在自己电脑上：

```bash
brew install multica-ai/tap/multica
multica setup self-host --server-url http://<服务器IP>:8080 --app-url http://<服务器IP>:3000
```

装 CLI 之前本机要至少有一个受支持的 Agent CLI，例如 `claude`（Claude Code）、`codex`（Codex）、`copilot`（GitHub Copilot CLI）、`opencode`（OpenCode）、`pi`（Pi）。

配好之后在 Web 界面进 **Settings → Runtimes** 应该能看到这台机器，再去 **Settings → Agents** 创建 Agent，然后就能把 issue 指派给它了。

`multica daemon status` 可以确认 daemon 是否在跑。

## 没打包进来的功能

**实时协作文档（collab）**：上游有一个可选的 `multica-collab` 服务，用于多人同时编辑 Workspace Docs。它的镜像 `ghcr.io/multica-ai/multica-collab` 自 v0.12.1 起才发布到 GHCR（v0.11.1 及更早取不到），本应用未包含该服务。需要时可按上游 compose 追加，注意它必须单副本运行（每个打开的文档常驻进程内存），且要用同一 `MULTICA_IMAGE_TAG` 与 `COLLAB_SECRET`。Docs 功能本身默认关闭（需要 `FF_DOCS_V1=true`），不影响看板、issue、Agent 这些主流程。

**对外集成**：Slack、飞书/Lark、企业微信、钉钉、Telegram、微信、GitHub App、Composio、S3 存储这些都需要额外的密钥与回调地址配置，本应用没有在表单里展开。需要时按下文的方式手动补。

## 手动补配置

需要额外能力时，编辑已安装应用的 compose 覆盖项，给 `multica-backend` 加环境变量，然后重启：

```yaml
environment:
  # GitHub App 集成（PR 镜像成卡片、CI 状态回填）
  GITHUB_APP_ID: "123456"
  GITHUB_APP_SLUG: "your-app-slug"
  GITHUB_APP_CLIENT_ID: "..."
  GITHUB_APP_CLIENT_SECRET: "..."
  GITHUB_WEBHOOK_SECRET: "..."
  GITHUB_APP_PRIVATE_KEY: "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
  # 对外可达的 API 地址，用于生成 webhook 回调 URL
  MULTICA_PUBLIC_URL: "https://api.example.com"
  # S3 / 兼容对象存储，替代本地 ./data/uploads
  S3_BUCKET: "..."
  AWS_ENDPOINT_URL: "..."
  AWS_ACCESS_KEY_ID: "..."
  AWS_SECRET_ACCESS_KEY: "..."
```

完整变量清单见上游仓库的 [`.env.example`](https://github.com/multica-ai/multica/blob/main/.env.example)，每一项都有注释说明。

## 备份

需要备份三样东西：

- `./data/postgres` —— 全部业务数据。停容器后整体打包，或用 `pg_dump`。
- `./data/uploads` —— issue 附件、头像等上传文件。
- 安装时生成的 `JWT_SECRET` 和 `DB_PASSWORD` —— 前者用于签发会话与附件下载链接，丢了会导致现有会话和已发出的下载链接全部失效；后者丢了连不上数据库。

升级前先备份。后端启动时会自动执行数据库迁移，迁移是单向的，回退版本不保证能读回旧库。

## 升级

```bash
docker compose pull
docker compose up -d
```

跨大版本升级前先看上游的 `SELF_HOSTING.md`，里面有特定版本需要先跑 backfill 命令的说明。

## 许可证与使用限制

Multica 不是标准开源项目，而是 **source-available**：以 Apache License 2.0 为主体，附加若干条件，合称「Multica License」。

- **自建自用、组织内部使用没问题**（含多个 workspace，不需要商业许可）。
- **不能把 Multica 作为托管服务提供给第三方**，即使免费、不带广告、没有付费版也需要商业许可。拿它对外运营 SaaS 或打包进对外销售的产品，先去找上游谈商业许可。
- **不能移除或修改 Multica 的 LOGO、产品名，以及界面上的版权与署名信息**。镜像里自带这些，改动即违反许可。
- **再分发时要附带完整的 LICENSE 文件**，只给 Apache 2.0 正文不算合规。
- `server/ee/` 与 `packages/ee/` 目录下的代码另有商业许可，不适用上述条款。

本应用只做了部署包装，不含任何上游代码修改。上游为 Index Labs (Hong Kong) Limited，完整条款见仓库根目录 [LICENSE](https://github.com/multica-ai/multica/blob/main/LICENSE)。

## 风险提示

镜像是上游发布的第三方镜像，本应用不对其安全性、可用性与合规性作任何保证，使用风险自负。部署到公网前请自行评估，并至少做到：改掉默认端口、配好 SMTP 与 `ALLOW_SIGNUP`、在前面加一层带 TLS 的反向代理。

## 来源

- 项目：<https://github.com/multica-ai/multica>
- 版本：0.12.1
- 架构：amd64 / arm64
