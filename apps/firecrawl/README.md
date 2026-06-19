# Firecrawl

将任意网站转换为适合大语言模型（LLM）的结构化数据。强大的网页抓取、爬取、搜索和数据提取平台。

## 功能特点

- **单页抓取**：将任意 URL 转换为 Markdown、HTML、截图或结构化 JSON
- **全站爬取**：递归抓取整个网站，智能过滤链接
- **URL 发现**：通过站点地图、索引查询或搜索快速发现网站所有 URL
- **网络搜索**：搜索网络并一次性获取结果的完整页面内容
- **AI 提取**：基于 LLM 的结构化数据提取，支持 Schema 验证
- **智能代理**：自主研究代理，自动导航并提取数据
- **远程浏览器**：支持远程浏览器会话，提供 CDP 访问和代码执行能力
- **批量操作**：异步批量抓取多个 URL
- **自托管支持**：完全开源，支持本地部署，数据掌握在自己手中

## 使用说明

### 默认端口

- API服务: 3002
- 队列管理界面: http://your-ip:3002/admin/YOUR_BULL_AUTH_KEY/queues

### API 访问

部署后可以通过 `http://your-ip:3002` 访问 API 服务。

测试爬取端点：
```bash
curl -X POST http://localhost:3002/v1/crawl \
    -H 'Content-Type: application/json' \
    -d '{
      "url": "https://firecrawl.dev"
    }'
```

### 数据目录

应用数据存储在以下目录：
- `./data/api` - API 服务数据
- `./data/postgres` - PostgreSQL 数据库数据
- `./data/redis` - Redis 缓存数据
- `./data/playwright` - Playwright 浏览器缓存

### 环境变量

- `POSTGRES_USER` / `POSTGRES_PASSWORD`：PostgreSQL 数据库凭据
- `BULL_AUTH_KEY`：队列管理界面的访问密钥
- `OPENAI_API_KEY`：OpenAI API 密钥（用于 AI 相关功能，可选）

### 架构说明

Firecrawl 自托管版本包含以下服务组件：
- **API 服务**：主 API 服务器，处理所有请求（4核CPU，8GB内存限制）
- **Playwright 服务**：浏览器自动化服务（2核CPU，4GB内存限制）
- **Redis**：任务队列和缓存后端
- **RabbitMQ**：NuQ 消息代理
- **PostgreSQL**：任务状态管理数据库

## 相关链接

- 官方网站: https://www.firecrawl.dev
- GitHub: https://github.com/firecrawl/firecrawl
- 文档: https://docs.firecrawl.dev
- Discord社区: https://discord.gg/firecrawl
