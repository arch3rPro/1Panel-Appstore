# MCPHub

MCPHub 通过将多个 MCP（Model Context Protocol）服务器组织为灵活的流式 HTTP（SSE）端点，简化了管理与扩展工作。系统支持按需访问全部服务器、单个服务器或按场景分组的服务器集合。

## 功能特点

- **集中式管理** - 在统一控制台中监控和管理所有 MCP 服务器
- **灵活路由** - 通过 HTTP/SSE 访问所有服务器、特定分组或单个服务器
- **细粒度分组可见性** - 在分组中可独立控制每个服务器的 Tool、Prompt 与 Resource 是否对外暴露
- **智能路由** - 基于向量语义搜索的 AI 工具发现
- **热插拔配置** - 无需停机即可添加、移除或更新服务器
- **OAuth 2.0 支持** - 客户端和服务端模式，实现安全认证
- **社交一键登录** - 通过 Better Auth 集成支持 GitHub 和 Google 快捷登录（需启用数据库模式）
- **数据库模式** - 将配置存储在 PostgreSQL 中，适用于生产环境

## 使用说明

### 默认端口

- Web界面: 3000

### 默认账号密码

- 用户名: admin
- 密码: 首次启动时自动生成，可在日志中查看，或通过环境变量 `ADMIN_PASSWORD` 预设

### 数据目录

应用数据存储在 `./data` 目录。

### MCP 配置

将 MCP 服务器配置文件 `mcp_settings.json` 放置在数据目录中，或通过 1Panel 文件管理器编辑。

示例配置：
```json
{
  "mcpServers": {
    "time": {
      "command": "npx",
      "args": ["-y", "time-mcp"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

### 连接 AI 客户端

通过以下地址连接 AI 客户端（Claude Desktop、Cursor 等）：

- `http://localhost:3000/mcp` - 所有服务器
- `http://localhost:3000/mcp/{group}` - 特定分组
- `http://localhost:3000/mcp/{server}` - 特定服务器
- `http://localhost:3000/mcp/$smart` - 智能路由

## 相关链接

- 官方网站: https://docs.mcphub.app
- GitHub: https://github.com/samanhappy/mcphub
- 文档: https://docs.mcphub.app
