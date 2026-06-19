# 9Router

免费 AI 路由器和 Token 节省工具。连接 40+ AI 提供商和 100+ 模型，支持 Claude Code、Cursor、Codex、Copilot、Cline 等 AI 编码工具。

## 功能特点

- RTK Token 节省 - 自动压缩工具输出内容，每次请求节省 20-40% token
- 智能 3 层降级 - 自动路由：订阅 → 廉价 → 免费模型，零停机
- 实时配额跟踪 - 实时 token 计数和重置倒计时
- 多账户支持 - 每个提供商支持多个账户，负载均衡
- 格式转换 - OpenAI ↔ Claude ↔ Gemini 格式互相转换
- 支持 40+ 提供商和 100+ 模型

## 使用说明

### 默认端口

- Web 界面: 20128

### 访问地址

- Dashboard: http://localhost:20128/dashboard
- OpenAI 兼容 API: http://localhost:20128/v1

### 数据目录

应用数据存储在 `./data` 目录，包含 SQLite 数据库和自动备份。

### 环境变量

- `DATA_DIR` - 数据目录路径（容器内固定为 /app/data）
- `PORT` - 服务端口（默认 20128）
- `HOSTNAME` - 监听地址（默认 0.0.0.0）
- `DEBUG` - 调试模式（可选，设为 true 启用）

## 相关链接

- 官方网站: https://9router.com
- GitHub: https://github.com/decolua/9router
- 文档: https://github.com/decolua/9router/blob/master/README.md
