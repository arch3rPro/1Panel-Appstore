# OpenViking

OpenViking 是火山引擎（Volcengine）开源的**面向 AI Agent 的自进化上下文数据库**。它把智能体的记忆（Memory）、知识 RAG（Resources）与技能（Skills）统一到一个 `viking://` 虚拟文件系统中，Agent 可以像读写文件一样 `ls`、`tree`、`read`、`write`、`grep`、`find` 上下文；每个目录都带有自动生成的摘要（L0/L1），便于先判断相关性再读取全文。

本应用封装官方镜像 `ghcr.io/volcengine/openviking`，包含：

- **OpenViking HTTP 服务**（默认端口 `1933`）
- **Web Studio 控制台**（`http://<IP>:1933/studio`）
- **VikingBot**（默认关闭，见下文）

## 版本与部署方式

- 固定版本：`0.5.2.1`，使用官方镜像 `ghcr.io/volcengine/openviking:v0.5.2.1`；保留原有 `0.5.2` 供已有安装使用。
- 滚动版本：`latest`，使用官方 `:latest` 标签，升级前请先备份。
- 官方 `v0.5.2.1` 镜像已核实支持 `linux/amd64` 和 `linux/arm64`。
- 使用内嵌本地文件与向量存储，不需要额外部署 Redis、外部向量数据库或 Caddy。HTTPS 可由 1Panel 反向代理提供。
- 图标来自官方仓库 `docs/images/ov-logo-square.png`。

## 主要特性

- 一个文件系统承载知识、记忆与技能，均可通过 `viking://` URI 浏览和检索。
- 目录级语义检索 `/find`，可按项目或记忆子树限定范围，而不是扫描整个向量库。
- L0 摘要 / L1 概览 / L2 全文三级上下文加载。
- 会话可归档为可读的 Markdown，并抽取记忆。
- 多账号与用户隔离，可选资源 ACL，支持 API Key 认证。
- 提供 Python / Go / TypeScript SDK 与 HTTP API。

## 使用说明

1. 安装时选择**模型预设**（默认 OpenAI），填入对应 **API 密钥**即可；也可全部留空先装，进去后再配置。完成后访问 `http://<你的IP>:<安装时设置的HTTP端口>/studio` 打开 Web Studio（默认端口 `1933`）。
2. 在 Studio 设置页填入安装时生成的 **root 密钥（Root API Key）**。
3. 在 **Users** 页面创建账号与用户，创建后会显示该用户的 **User API Key**。日常数据访问请使用 User/Admin Key，root 密钥仅用于管理。
4. 也可以使用 CLI、SDK 或 `curl` 连接：

   ```bash
   curl http://<你的IP>:1933/health
   curl "http://<你的IP>:1933/api/v1/fs/ls?uri=viking://" -H "X-API-Key: <User API Key>"
   ```

## 模型配置（重要）

OpenViking 需要**向量嵌入模型（Embedding）**和**视觉语言模型（VLM）**才能导入与检索。官方 Docker 镜像**不含**本地嵌入模型依赖，因此实际必须使用 API 方式提供模型。

安装表单只需两步，其余由预设自动推导：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| HTTP 端口 | 是 | 默认 `1933`，一般不用改 |
| root 密钥 | 是 | 自动随机生成，直接保存；就是 Studio 登录密码 |
| 模型预设 | 是 | 下拉选择，默认 OpenAI，无需手填任何模型名 |
| 模型 API 密钥 | 否 | **唯一需要输入的字段** |
| 高级 - 覆写 API 地址 / 嵌入模型 / 维度 / VLM | 否 | 只在需要用代理或换模型时填写 |

预设自动推导的完整参数：

| 预设 | provider | API 地址 | Embedding（维度，输入类型） | VLM |
| --- | --- | --- | --- | --- |
| OpenAI | `openai` | `https://api.openai.com/v1` | `text-embedding-3-small`（1536，`text`） | `gpt-4o` |
| 火山方舟 | `volcengine` | `https://ark.cn-beijing.volces.com/api/v3` | `doubao-embedding-vision-251215`（1024，`multimodal`） | `doubao-seed-2-0-lite-260428` |
| Ollama | `ollama` | `http://host.docker.internal:11434/v1` | `nomic-embed-text`（768，`text`） | `qwen2.5:7b` |
| 自定义 | `openai` | 需填「高级 - 覆写 API 地址」 | 需填覆写的模型与维度 | 需填覆写的 VLM |

要点：

- **API 密钥留空 = 先装后配**。服务会正常启动并进入健康状态（健康检查走 `/health`，只验证进程存活），但 `/ready` 会显示 `embedding: not_initialized`，导入与检索会失败，直到配好模型；之后在 Web Studio 的**设置 → 服务端配置**里填好模型并「保存并重启」，或点击「文件模式」直接改整份 `ov.conf`。这是官方推荐的后配路径，不需要重装。
- **使用 Ollama 可以完全不填密钥**，预设会自动用占位值；Ollama 需监听容器可达地址并允许 Docker 网段访问，不要暴露到公网。
- **需要代理或换模型**：保持预设不变，只填对应的「高级 - 覆写」项，覆写值优先于预设。
- **自定义（OpenAI 兼容）** 必须同时给出 API 地址、嵌入模型、维度和 VLM；缺任一项时服务按「无模型」启动，并在容器日志 `[ov-init]` 中说明缺什么。
- 子启脚本只生成 `server` 与 `storage` 两个必需段；模型段仅在参数完整时写入。生成的 `ov.conf` 权限为 `600`，且**已存在时绝不覆盖**（Studio 的修改不会被重装覆盖）。
- 使用第三方模型 API 可能产生费用；切换嵌入模型或维度会导致已有向量集合不兼容，需要重建索引。

## 数据目录

- 持久化目录：`./data` 挂载到容器内的 `/app/.openviking`
  - `ov.conf`：服务配置
  - `ovcli.conf`：CLI 配置
  - `data/`：工作区（账号、资源、向量数据等）

升级前停止应用并备份整个 `./data`，不要只备份 `ov.conf`。本地向量后端不支持多个实例同时共享工作区。

## 修改配置

`ov.conf` 只在首次启动（文件不存在）时由预设参数生成，权限 `600`，持久化在 `./data/ov.conf`。**安装后修改表单参数不会重新生成配置**，三种改法任选：

1. **Web Studio（推荐）**：ROOT 登录 → 设置 → 服务端配置，表单模式改 `embedding`/`vlm`，或「文件模式」直接编辑 `ov.conf` 原文（端口、`root_api_key`、`storage` 等），保存后点「保存并重启」。
2. 直接编辑宿主机的 `./data/ov.conf` 后重启容器。
3. 进入容器重新跑配置向导：

```bash
docker exec -it <容器名> openviking-server doctor   # 校验配置与模型访问
 docker exec -it <容器名> openviking-server init     # 交互向导重新生成
 docker restart <容器名>
```

想让安装表单重新生效，请先备份再删除 `./data/ov.conf`；容器内端口固定 `1933`，宿主机端口请在 1Panel 应用参数中修改。

## 常用设置

- **启用 VikingBot**：默认关闭。API Key 模式下 Bot 需要一个 User/Admin 密钥（不能使用 root 密钥）。在 `./data/ov.conf` 中配置 `bot.ov_server.api_key` 后，将 compose 中的 `OPENVIKING_WITH_BOT` 改为 `1` 并重启。
- **中国大陆镜像加速**：若 `ghcr.io` 访问缓慢，可在 `docker-compose.yml` 中改用注释里的火山引擎镜像 `openviking-cn-beijing.cr.volces.com/volcengine/openviking`。
- **公网访问 / HTTPS**：建议由 1Panel 反向代理到安装时设置的 HTTP 端口，并在 `ov.conf` 的 `server.public_base_url` 中填写外部 HTTPS 地址。限制直连端口的访问范围，妥善保管 root 密钥和用户密钥；按需将 `server.cors_origins` 从 `*` 收紧到实际站点。
- **健康检查**：`/health` 只表示进程存活，不验证模型凭据；使用 `/ready` 和 `openviking-server doctor` 检查就绪状态与模型访问。

## 端口

- `1933`：HTTP 服务与 Web Studio（安装时可修改映射端口）。

## 相关链接

- 官网：<https://openviking.ai/>
- 文档：<https://docs.openviking.ai/>
- GitHub：<https://github.com/volcengine/OpenViking>
- 部署指南：<https://docs.openviking.ai/en/guides/03-deployment>
- 配置指南：<https://docs.openviking.ai/en/guides/01-configuration>
