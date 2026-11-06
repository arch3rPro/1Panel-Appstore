# magpie

多 Agent 统一 AI 网关。一个网关，给所有 AI 编程工具统一提供模型：Claude Code 用 Kimi、Codex 用 DeepSeek、Gemini CLI 用 GLM，切换到哪个模型都只改一处。

> 本项目是 [yetone/magpie](https://github.com/yetone/magpie) 的 1Panel 容器化封装。桌面版（菜单栏 App）不在本应用范围内，这里跑的是**网关模式**：给其他机器上的 Agent 提供模型、账号与路由能力。
>
> **版本说明**：`latest/` 跟随上游 `latest` 镜像；`0.1.3150/` 是固定版本目录（镜像 tag `0.1.3150`），推荐按固定版本安装，避免上游高频发版带来的非预期变更。上游每个 release 对应一个 `0.1.x` 镜像 tag，版本号是构建序号，升级跳号属于正常现象。

## 功能特点

- **任意模型给任意 Agent**：支持 Claude Code、Codex、Gemini CLI、OpenCode、Cursor CLI、Copilot CLI、Qwen Code、Crush、Zed、Cline 等几十种工具
- **复用订阅账号**：ChatGPT、Claude、GitHub Copilot、Gemini、Antigravity、Grok 订阅可直接当供应商用，多账号自动故障转移
- **路由组与自动切换**：`smart` / `order` / `rotate` / `usage` / `pace` 五种策略，额度耗尽时自动换账号或换模型，Agent 不感知报错
- **用量与成本核算**：token、缓存读写、推理用量与金额，按账号/密钥/模型统计，支持 OTLP 导出
- **隐私脱敏**：开启后提示词里的密钥、密码、邮箱等在本机替换为占位符，回复中再还原，上游厂商看不到真实值
- **插件与网关中间件**：基于 Bun 的插件可接入订阅登录、改写请求、过滤敏感词、映射模型名
- **额外工具**：Web 搜索、图像生成、视频生成通过 MCP 提供给任意 Agent
- **自带 Web 管理界面**：供应商、网关密钥、路由、用量、会话、插件、设置全部图形化管理
- **多协议**：同时在 `3425` 提供 OpenAI Chat / OpenAI Responses / Anthropic Messages / Gemini 协议并自动互转

## 使用方法

### 1. 打开管理界面

安装完成后浏览器访问：

```text
http://<服务器IP>:3430
```

首次打开会提示输入访问密钥，密钥就是安装时填写的 `MAGPIE_WEB_KEY`（若使用随机生成，可在 1Panel 应用详情的「参数 / 环境变量」中查看，形如 `magpie-web-key-change-me_ab12cd`）。也可以直接访问：

```text
http://<服务器IP>:3430/?k=<MAGPIE_WEB_KEY>
```

登录成功后浏览器会记住 400 天。

> ⚠️ 建议把 `MAGPIE_WEB_KEY` 改成自己生成的高强度值（`openssl rand -hex 16`，只允许字母、数字和 `- . _ ~`，长度至少 16）。

### 2. 添加供应商

**Providers → Add provider**：选预设（DeepSeek、Kimi、智谱 GLM、MiniMax、通义千问、火山方舟、OpenRouter、SiliconFlow、Ollama、LM Studio 等）填 Key 即可，也可以添加任意 OpenAI / Anthropic 兼容地址。

订阅类账号（ChatGPT、Claude…）在浏览器里完成登录后，厂商会回调到 `http://localhost:1455/...`，那台机器是你的电脑而不是容器，页面打不开是正常的：**把浏览器地址栏里完整的回调 URL 复制出来，粘贴到 magpie 的 Callback 字段**即可。

### 3. 给其他机器建网关密钥

**Gateway → Gateway keys → 新增**，得到 `sk-magpie-key-...`。每台调用方机器、每个客户端各建一个，可以单独限制模型与每日/每周/每月额度。

### 4. 让 Agent 指向网关

在运行 Agent 的机器上设置（模型名写成 `provider/model`，或路由组名 `group/xxx`）：

```bash
# OpenAI 兼容客户端（Codex、Cursor、Cline、OpenCode、Qwen Code 等）
export OPENAI_BASE_URL=http://<服务器IP>:3425/v1
export OPENAI_API_KEY=sk-magpie-key-...

# Anthropic 兼容客户端（Claude Code）
export ANTHROPIC_BASE_URL=http://<服务器IP>:3425
export ANTHROPIC_API_KEY=sk-magpie-key-...

# Gemini 兼容客户端
export GOOGLE_GEMINI_BASE_URL=http://<服务器IP>:3425
export GEMINI_API_KEY=sk-magpie-key-...
```

也可以用 `magpie provider add remote-magpie sk-magpie-key-... url=http://<服务器IP>:3425 id=office` 把本应用当「远程 magpie」，让 magpie 自动改写本机各个 Agent 的配置。

### 5. 常用命令

1Panel 应用详情的终端（或 `docker exec -it <容器名> bash`）里可直接使用 CLI：

```bash
magpie provider add deepseek sk-…      # 添加供应商
magpie provider add ollama             # 本地模型服务
magpie presets                         # 内置预设列表
magpie group add "Opus anywhere" models=claude/claude-opus,copilot/claude-opus routing=smart
magpie gateway-key add "Laptop"        # 新建网关密钥
magpie quota                           # 查看各套餐剩余额度
magpie usage                           # 用量
```

## 端口

| 端口 | 用途 |
| --- | --- |
| `3430` | Web 管理界面 |
| `3425` | 网关 API（OpenAI / Anthropic / Gemini 兼容，其他机器上的 Agent 调用） |

## 数据目录

所有持久化数据都在 `./data`（容器内 `/config`）：

| 路径 | 内容 |
| --- | --- |
| `data/magpie` | 设置、供应商、网关密钥、路由组 |
| `data/home` | 容器内 `HOME`，各订阅账号的登录态 |
| `data/cache` | 模型目录、插件运行时 Bun、下载的 Claude Code |
| `data/data`、`data/state` | 其余数据与状态 |

> 应用以 root 身份在容器内运行（上游镜像默认 uid 65532，与 1Panel 创建的 `./data` 目录权限不匹配会导致无法写入），容器本身无特权、无宿主机额外挂载。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `MAGPIE_WEB_KEY` | Web 界面访问密钥，至少 16 位，仅支持字母、数字和 `- . _ ~` |
| `MAGPIE_PUBLIC_URL` | 对外访问地址，例如 `http://192.168.1.20:3425`，填了之后界面与日志里显示的就是这个地址 |
| `MAGPIE_ALLOW_IPS` | 允许访问网关与界面的客户端 IP / CIDR 白名单，逗号分隔；其他来源一律 403 |
| `DO_NOT_TRACK` | `1` 关闭上游匿名使用上报（默认关闭）；`0` 跟随上游默认开启 |
| `MAGPIE_TLS_CERT` / `MAGPIE_TLS_KEY` | 可选，挂载证书后由 magpie 自己提供 HTTPS（需手动加到 compose） |

## 注意事项

- **不要直接暴露到公网**：`3430` 管理界面等同于全部密钥，`3425` 网关也必须配合网关密钥。对外使用请走 VPN（Tailscale / WireGuard）、1Panel 反向代理 + HTTPS，或设置 `MAGPIE_ALLOW_IPS` 白名单。
- **首次下载依赖网络**：插件要下载 Bun，Claude 订阅需要下载 Anthropic 官方 Claude Code（缓存在 `data/cache`，几百 MB）；网络受限时可先只用 API Key 供应商。
- **升级**：选择固定版本目录安装后，1Panel 会提示新版本；也可以直接重建容器使用 `latest` 镜像。数据始终保存在 `./data` 中。
- 上游发版非常频繁（每个版本一个 tag），固定版本目录由仓库更新脚本按天跟进。

## 相关链接

- 官网: https://usemagpie.ai
- GitHub: https://github.com/yetone/magpie
- Docker 部署文档: https://usemagpie.ai/docs/docker
- 完整参考手册: https://github.com/yetone/magpie/blob/main/docs/reference.md
