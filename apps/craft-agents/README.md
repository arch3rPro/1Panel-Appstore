# Craft Agents

Craft Agents 是一个强大的 AI Agent 工作空间，支持多种 LLM 提供商和 MCP 集成。

## 功能特点

- **多 LLM 提供商支持**：支持 Anthropic、Google AI Studio、ChatGPT Plus、GitHub Copilot 等多种 AI 提供商
- **MCP 集成**：支持连接 MCP 服务器、REST API 和本地文件系统
- **多会话管理**：具有收件箱/归档功能，支持会话标记和状态工作流
- **权限模式**：三级权限系统（探索、询问编辑、自动），可自定义规则
- **动态状态系统**：可自定义会话工作流状态（待办、进行中、完成等）
- **自动化**：支持事件驱动的自动化，可基于标签变化、计划任务、工具使用等触发
- **无头服务器模式**：可作为远程服务器运行，桌面应用作为瘦客户端连接
- **Web UI**：内置 Web 界面，可通过浏览器访问和管理

## 使用说明

### 默认端口

- Web 界面/RPC 端口: 9100

### 配置说明

#### 必需参数

- **服务器令牌 (CRAFT_SERVER_TOKEN)**：用于客户端认证的 Bearer 令牌，系统会自动生成格式为 `Craft-Agents-<随机复杂密码>` 的安全令牌，您也可以自定义

#### 可选参数

- **Web 端口 (PANEL_APP_PORT_HTTP)**：Web界面访问端口，默认为 `9100`

#### 安全说明

⚠️ **重要提示**：本应用默认使用 `--allow-insecure-bind` 参数启动，允许在内网环境下使用非加密的 `ws://` 协议。这适用于以下场景：

- ✅ **内网环境**：应用运行在受信任的内网环境中
- ✅ **反向代理**：通过 Nginx/Caddy 等反向代理处理 TLS
- ❌ **公网直接暴露**：不推荐直接暴露到公网

**生产环境建议**：
- 使用反向代理（如 Nginx、Caddy）处理 TLS 加密
- 或在容器内配置 TLS 证书（设置环境变量 `CRAFT_RPC_TLS_CERT` 和 `CRAFT_RPC_TLS_KEY`），并移除 `--allow-insecure-bind` 参数

**数据存储**：应用数据存储在Docker命名卷中，由Docker自动管理权限，无需手动配置。

### 连接方式

#### 通过 Web UI 访问

部署后，通过浏览器访问 `http://<服务器IP>:9100`，使用设置的服务器令牌登录。

#### 通过桌面应用连接

在 Craft Agents 桌面应用中，配置远程工作空间：
- URL: `ws://<服务器IP>:9100` 或 `wss://<服务器IP>:9100`（启用 TLS 时）
- Token: 部署时设置的服务器令牌

### 数据目录

应用数据存储在Docker命名卷 `craft-agents-data` 中，映射到容器内的 `/home/craftagents/.craft-agent` 目录，包括：
- 配置文件
- 会话数据
- 工作空间设置
- 技能和源配置

**数据管理**：
- 数据卷由Docker自动管理，无需手动设置权限
- 数据会持久化保存，即使容器删除也不会丢失
- 可以通过 `docker volume inspect craft-agents-data` 查看数据位置

### 安全访问方式

根据官方文档，推荐以下几种安全访问方式：

#### 方式1：Tailscale（推荐）

Tailscale 创建设备间的私有网格网络，无需端口转发、证书或防火墙规则。

**优势**：
- ✅ 无需配置TLS证书
- ✅ 端到端加密
- ✅ 服务器只能从您的Tailscale网络访问

**配置方法**：
```yaml
environment:
  - CRAFT_RPC_HOST=100.x.y.z  # Tailscale IP
```

#### 方式2：反向代理（nginx, Caddy）

标准的生产部署方式，反向代理处理TLS终止和访问控制。

**Caddy 示例**（自动HTTPS）：
```
craft.example.com {
    reverse_proxy localhost:9100
}
```

**Nginx 示例**：
```nginx
server {
    listen 443 ssl;
    server_name craft.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:9100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

使用反向代理时，应用绑定到 localhost：
```yaml
environment:
  - CRAFT_RPC_HOST=127.0.0.1
```

#### 方式3：Cloudflare Tunnel

无需开放端口或管理证书，通过HTTPS暴露服务。

**快速隧道**（即时HTTPS URL）：
```bash
cloudflared tunnel --url http://localhost:9100
```

会生成一个 `https://<random>.trycloudflare.com` URL。

**永久自定义域名**：
```bash
# 一次性设置
cloudflared tunnel login
cloudflared tunnel create craft-agents
cloudflared tunnel route dns craft-agents agents.yourdomain.com

# 运行隧道
cloudflared tunnel run --url http://localhost:9100 craft-agents
```

#### 方式4：SSH隧道

快速临时访问，无需任何设置：

```bash
# 在客户端：转发本地端口9100到远程服务器
ssh -L 9100:localhost:9100 user@your-server
```

然后从桌面应用或浏览器连接到 `ws://localhost:9100`。

#### 方式5：直接配置TLS证书

如需直接在应用中启用TLS，需要：

1. **生成证书**（参考官方文档）：
   ```bash
   # 使用官方脚本生成开发证书
   ./scripts/generate-dev-cert.sh
   ```

2. **修改 docker-compose.yml**：
   ```yaml
   volumes:
     - craft-agents-data:/home/craftagents/.craft-agent
     - ./certs:/certs:ro  # 挂载证书目录

   environment:
     - CRAFT_SERVER_TOKEN=${CRAFT_SERVER_TOKEN}
     - CRAFT_RPC_HOST=0.0.0.0
     - CRAFT_RPC_TLS_CERT=/certs/cert.pem
     - CRAFT_RPC_TLS_KEY=/certs/key.pem
   ```

3. **移除 `--allow-insecure-bind` 参数**

#### 访问方式

- **启用TLS后**：
  - Web UI: `https://192.168.123.201:9100`
  - 桌面客户端: `wss://192.168.123.201:9100`

- **不启用TLS（仅内网测试）**：
  - Web UI: `http://192.168.123.201:9100`
  - 桌面客户端: 可能无法连接（浏览器API限制）

**推荐顺序**：
1. Tailscale（最简单安全）
2. 反向代理（标准生产方案）
3. Cloudflare Tunnel（无需端口转发）
4. SSH隧道（临时访问）
5. 直接TLS配置（不推荐）

## 支持的 LLM 提供商

### 直接连接

- **Anthropic**：API 密钥或 Claude Max/Pro OAuth
- **Google AI Studio**：API 密钥
- **ChatGPT Plus / Pro**：Codex OAuth
- **GitHub Copilot**：OAuth（设备代码）

### 第三方提供商

通过自定义端点支持：
- OpenRouter
- Vercel AI Gateway
- Ollama（本地模型）
- 其他 OpenAI 兼容端点

## 相关链接

- 官方网站: https://agents.craft.do
- GitHub: https://github.com/lukilabs/craft-agents-oss
- 文档: https://github.com/lukilabs/craft-agents-oss#readme

## 许可证

Apache License 2.0
