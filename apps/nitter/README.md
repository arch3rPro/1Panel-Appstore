# Nitter 介绍

## 产品介绍

Nitter 是一款免费开源、注重隐私的 Twitter/X 替代前端。它不依赖 JavaScript、无广告、无追踪、无付费墙，无需登录即可浏览推文、时间线和搜索内容，适合自建部署后匿名使用 Twitter/X。

本应用基于 [xiaoY233/nitter](https://github.com/xiaoY233/nitter)（zedeus/nitter 的分支）构建，在保留网页前端的同时内置了定制功能：

- **Agent API**：七个只读工具，通过 REST（`/api/v1/...`）和 MCP（`POST /mcp`）提供给 AI Agent 使用。
- **全新网页界面**：X 风格三栏布局，内置 X、Vercel、Mono、Claude、Codex、TikTok 六套主题（各有浅色/深色），支持一键切换简体中文界面。
- **开箱即用的令牌保护**：安装时自动生成 API 令牌，内置 Redis 缓存，无需额外安装 Redis。

## 主要功能

- **Agent 只读接口**：`get_user`、`get_user_timeline`、`get_tweet`、`get_thread`、`search_tweets`、`search_users`、`get_user_connections`，支持 Markdown / JSON 输出与统一分页
- **REST + MCP 双协议**：`/api/v1/...`、`/mcp`（Streamable HTTP）、`/llms.txt`、`/api/v1/openapi.json` 自动描述接口
- **隐私友好**：网页端无需登录、无追踪、无广告、无 JavaScript
- **RSS 支持**：可订阅用户、列表和搜索关键词
- **多主题与中文界面**：六套配色主题，浅色/深色/跟随系统，界面可切换为简体中文
- **内置 Redis 缓存**：提升访问性能，减少对 X 的重复请求
- **令牌与限速**：Bearer 令牌、按令牌限速、Origin 检查，避免会话额度被耗尽

## API 令牌与接口地址

安装时会自动生成 `NITTER_API_TOKENS`（在应用「参数」中可查看和修改，格式为 `name:secret`，只填 `secret` 也可以）。请求时使用冒号后面的部分：

```bash
# 健康检查（无需令牌）
curl http://服务器IP:端口/api/v1/health

# 读取用户资料（Markdown 输出）
curl -H "Authorization: Bearer <secret>" \
  "http://服务器IP:端口/api/v1/users/jack?format=markdown"

# MCP 端点为 http://服务器IP:端口/mcp
```

MCP 客户端（如 Claude Code）示例：

```bash
claude mcp add --transport http nitter http://服务器IP:端口/mcp \
  --header "Authorization: Bearer <secret>"
```

> 安全提示：API 面向受信任网络使用，每次调用都会消耗你 X 账号会话的额度。不要将端口直接暴露到公网，建议通过反向代理并配合 HTTPS。

## ⚠️ 重要：需要配置 Twitter/X 会话

Nitter **必须**提供 X 账号会话文件 `sessions.jsonl` 才能读取推文数据，已无匿名/游客模式。使用本仓库自带的工具生成（需要一个真实 X 账号）：

```bash
# 克隆仓库并安装依赖
git clone https://github.com/xiaoY233/nitter && cd nitter
pip install -r tools/requirements.txt

# 登录并生成会话（可加 --headless 无头运行）
python3 tools/create_session_browser.py 你的X用户名 你的X密码 TOTP密钥 --append sessions.jsonl
```

将生成的 `sessions.jsonl` 内容放入应用安装目录的 `data/sessions.jsonl`（替换安装时生成的空文件），然后重启应用。

> 说明：本应用安装时会生成一个空的 `sessions.jsonl` 占位文件，仅用于保证容器能正常启动；未放入真实会话前，网页可以打开但无法加载推文，`/api/v1/health` 会返回 `no_sessions`。

## 使用说明

1. 安装后访问 `http://服务器IP:端口` 打开网页界面，左栏底部的「外观设置」可切换界面语言（English / 中文）与主题。
2. 主要配置保存在应用安装目录 `data/nitter.conf` 中：
   - 修改 `[Server]` 的 `hostname` 为你的域名或 IP，用于生成正确链接。
   - 修改 `[Config]` 的 `hmacKey` 为随机值（可用 `openssl rand -hex 32` 生成），用于签名媒体链接。
   - `[Api]` 中默认已开启 Agent API；令牌通过环境变量 `NITTER_API_TOKENS` 传入，也可以直接写在 `tokens` 中。
   - 如需 HTTPS 访问，建议通过反向代理（如 1Panel 网站）配置，并保持 `https = false`。
3. 修改配置或更换 `sessions.jsonl` 后需重启应用生效。
4. Redis 数据保存在 `data/redis` 目录下，缓存可安全清理，不影响使用。

## 注意事项

- `nitter.conf` 与 `sessions.jsonl` 必须存在，请勿删除或改名为目录；容器以只读方式挂载这两个文件。
- `sessions.jsonl` 为空时应用能启动，但无法加载推文，必须放入真实会话。
- 如果日志提示 `[Api] enabled = true but no tokens are configured`，请在应用参数中重新填写 `NITTER_API_TOKENS`，或在 `nitter.conf` 中把 `[Api]` 的 `enabled` 改为 `false`。
- 从旧版（zedeus/nitter 镜像）升级时，原有的 `data/nitter.conf` 会被保留，需要手动添加 `[Api]` 配置并填写令牌才能使用 Agent API。
- 官方镜像目前仅提供 amd64 版本，arm64 需要自行构建。
- 本项目使用 AGPL-3.0 许可，若对外提供服务需向使用者提供所运行版本的源码。

## 相关链接

- [项目仓库](https://github.com/xiaoY233/nitter)
- [部署文档](https://github.com/xiaoY233/nitter/blob/master/docs/deployment.md)
- [Agent API / MCP 文档](https://github.com/xiaoY233/nitter/blob/master/docs/agent-api.md)
- [会话生成说明](https://github.com/xiaoY233/nitter/blob/master/docs/sessions.md)
- [原版 Nitter](https://github.com/zedeus/nitter)
- [Docker 镜像](https://hub.docker.com/r/vuldocker/nitter)
