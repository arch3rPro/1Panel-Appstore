# AxonHub

一站式AI开发平台 - 统一API网关，支持多种LLM提供商。

## 功能特点

- 🔄 **任意SDK调用任意模型** - 使用OpenAI SDK调用Claude，或使用Anthropic SDK调用GPT，零代码修改
- 🔍 **完整请求追踪** - 线程感知的可观测性，完整的请求时间线，快速调试
- 🔐 **企业级RBAC** - 细粒度访问控制、使用配额和数据隔离
- ⚡ **智能负载均衡** - <100ms自动故障转移，始终路由到最健康的通道
- 💰 **实时成本追踪** - 每请求成本分解，输入、输出、缓存令牌全追踪

## 支持的LLM提供商

- OpenAI (GPT-4, GPT-4o, GPT-5等)
- Anthropic (Claude 3.5, Claude 3.0等)
- Zhipu AI (GLM-4.5, GLM-4.5-air等)
- Moonshot AI/Kimi (kimi-k2等)
- DeepSeek (DeepSeek-V3.1等)
- ByteDance Doubao (doubao-1.6等)
- Gemini (Gemini 2.5等)
- Fireworks (MiniMax-M2.5, GLM-5, Kimi K2.5等)
- Jina AI (Embeddings, Reranker等)
- OpenRouter (多种模型)
- ZAI (图像生成)
- AWS Bedrock (Claude on AWS)
- Google Cloud (Claude on GCP)
- NanoGPT (多种模型, 图像生成)

## 使用说明

### 首次访问

1. 访问 `http://<服务器IP>:8090`
2. 按照设置向导创建管理员账户（密码至少6位）
3. 登录后配置AI提供商的API密钥
4. 创建API密钥开始使用

### 默认端口

- Web界面: 8090

### 数据库配置

默认使用SQLite数据库，数据存储在 `./data` 目录。

如需使用PostgreSQL或MySQL，请参考官方文档配置环境变量：
- `AXONHUB_DB_DIALECT`: 数据库类型 (postgres/mysql/sqlite3)
- `AXONHUB_DB_DSN`: 数据库连接字符串

### 数据目录

应用数据存储在 `./data` 目录。

## 快速开始

### 使用OpenAI SDK调用Claude

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8090/v1",  # 指向AxonHub
    api_key="your-axonhub-api-key"        # 使用AxonHub API密钥
)

# 使用OpenAI SDK调用Claude！
response = client.chat.completions.create(
    model="claude-3-5-sonnet",  # 或 gpt-4, gemini-pro, deepseek-chat...
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## 相关链接

- 官方网站: https://github.com/looplj/axonhub
- GitHub: https://github.com/looplj/axonhub
- 文档: https://github.com/looplj/axonhub#readme
- Demo: https://axonhub.onrender.com (Email: demo@example.com, Password: 12345678)
