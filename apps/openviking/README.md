# OpenViking

OpenViking 是火山引擎开源的自进化上下文数据库：Agent 的记忆、知识库和技能都放在同一个 `viking://` 文件系统里，像读写文件一样浏览、搜索、管理。

装之前要先准备一样东西：一个能用的模型 API Key（OpenAI、火山方舟，或你自己的 OpenAI 兼容服务），或者一台装好模型的 Ollama。这个 Key 是必填的——不填也能装上、也会显示"正常"，但导入和检索会全部失败，原因见下面第 4 节。

本应用封装官方镜像 `ghcr.io/volcengine/openviking`，包含 HTTP 服务（默认端口 `1933`）、Web Studio 控制台和 VikingBot（默认关闭）。固定版本 `0.5.6`，官方镜像已核实支持 `linux/amd64` 和 `linux/arm64`；另提供 `latest` 滚动版本，升级前请先备份。

## 1. 安装

安装表单有 8 项，前 4 项常用，后 4 项只在预设选「自定义」时才需要填：

| 参数 | 怎么填 |
| --- | --- |
| HTTP 端口 | 默认 `1933`，一般不用改 |
| root 密钥 | 自动随机生成，**先保存下来**，它就是 Studio 的登录密码 |
| 模型预设 | 四选一：OpenAI（含兼容代理）、火山方舟、Ollama、自定义（OpenAI 兼容），默认 OpenAI |
| 模型 API 密钥 | 填预设对应的 Key。**选 OpenAI / 火山方舟 / 自定义时必填；选 Ollama 不用填** |
| 高级 - 覆写模型 API 地址 | 仅选「自定义」时填 |
| 高级 - 覆写向量嵌入模型 | 仅选「自定义」时填 |
| 高级 - 覆写向量维度 | 仅选「自定义」时填 |
| 高级 - 覆写视觉语言模型 (VLM) | 仅选「自定义」时填 |

选前三个预设时，模型名、API 地址、向量维度都不用你填，预设已经配好：

| 预设 | 对话与视觉模型 | 向量模型（维度） |
| --- | --- | --- |
| OpenAI | `gpt-4o` | `text-embedding-3-small`（1536） |
| 火山方舟 | `doubao-seed-2-0-lite-260428` | `doubao-embedding-vision-251215`（1024） |
| Ollama | `qwen2.5:7b` | `nomic-embed-text`（768） |

### 用自定义模型接口

想接自己的 OpenAI 兼容服务（自建中转、One-API、其他厂商的兼容接口）时，预设选「自定义（OpenAI 兼容）」，然后填满这 5 项：模型 API 密钥（在上方）、高级 - 覆写模型 API 地址、高级 - 覆写向量嵌入模型、高级 - 覆写向量维度、高级 - 覆写视觉语言模型 (VLM)。

地址要写到 `/v1` 为止，例如 `https://your-proxy.example.com/v1`；向量维度必须和该向量模型真实输出维度一致（不填或填错都启动不了模型）；缺任一项时服务会按「无模型」启动，容器日志 `[ov-init]` 里会写明缺了什么。

### 用 Ollama 本地模型

1. 在宿主机装好 Ollama，拉两个模型：`ollama pull nomic-embed-text`、`ollama pull qwen2.5:7b`。
2. Ollama 默认只监听 `127.0.0.1`，容器访问不到。启动时设 `OLLAMA_HOST=0.0.0.0`，并允许 Docker 网段访问。
3. 安装时预设选「Ollama 本地模型」，模型 API 密钥留空即可。容器里已经把 `host.docker.internal` 指向宿主机，预设默认连 `11434`。
4. 想换别的 Ollama 模型：可以选预设「自定义」并把 API 地址填成 Ollama 的 `http://host.docker.internal:11434/v1`、向量模型和 VLM 分别填对应模型；也可以装完后去 Studio 的「文件模式」改 `ov.conf`（见第 4 节）。

Ollama 端口不要暴露到公网。

## 2. 装完三步

1. 打开 `http://<你的IP>:<安装时的HTTP端口>/studio`，账号 `root`，密码是参数页里的 **root 密钥**。
2. 在 **Users** 页面建一个账号和用户，创建完会直接显示该用户的 **User API Key**，复制保存。
3. 日常访问都用这个 User Key（CLI、SDK、`curl` 都一样）。root 密钥只管管理，拿它调数据接口会被拒绝（`PERMISSION_DENIED`）。

```bash
curl http://<你的IP>:1933/health
curl "http://<你的IP>:1933/api/v1/fs/ls?uri=viking://" -H "X-API-Key: <User API Key>"
```

## 3. 怎么确认真的能用

三个检查入口，只管到各自那一段，别看错：

| 入口 | 查什么 | 可信度 |
| --- | --- | --- |
| `GET /health` | 进程还活着 | 只能说明没崩，模型对不对完全看不出 |
| `GET /ready` | 各组件就绪状态 | **模型这项不可信，永远显示 ok**。它只看配置里有没有 embedding 这一节，不会真去调用。Key 写错了、本地向量模型加载失败，它照样一片绿。只有 Ollama 连不上时它会有反应（那项显示 `unreachable`） |
| `openviking-server doctor` | 真的去访问模型 | 唯一能查出模型不可用的办法，但**输出的视觉模型（VLM）那一项也不真测**，显示 PASS 别全信 |

所以装完请跑一次 doctor：

```bash
docker exec -it <容器名> openviking-server doctor
```

看两行：`Embedding` 是 PASS 才算模型通；如果是 `FAIL` / `probe failed`，回来检查 Key、API 地址或 Ollama 是否可达。

## 4. 常见问题

**改了安装参数没生效。**
`ov.conf` 只在第一次启动时生成，之后改表单不会再碰它。想让表单重新生效：先备份 `./data/ov.conf`，删掉它，再重启容器——但这会丢掉你后来在 Studio 里做的所有配置。

**换了向量模型，老数据搜不到了。**
向量库和模型（以及维度）是绑定的，换模型后旧向量不兼容，需要重新导入或重建索引。

**ghcr.io 拉不动 / 很慢。**
把 `docker-compose.yml` 里注释掉的那行镜像启用（`openviking-cn-beijing.cr.volces.com/volcengine/openviking:v0.5.6`），替换掉 ghcr 那行。

**想改 API 地址、换向量模型、加视觉模型。**
表单选「自定义」就能覆盖大多数场景：填上 API 地址、向量模型、维度、VLM 模型，密钥填在上方同一个框里。只有需要更细的控制（`thinking`、`temperature`、`cors_origins`、`public_base_url` 这类细节）才需要进 Studio → 设置 → 服务端配置 → **文件模式**，直接编辑 `ov.conf` 原文，保存后点「保存并重启」。也可以改宿主机上的 `./data/ov.conf` 再重启容器，效果一样。想整体重来才用容器里的交互向导：`docker exec -it <容器名> openviking-server init`。

**VikingBot 怎么开。**
默认关闭。API Key 模式下 Bot 需要一个 User/Admin 密钥（root 密钥不行）。在 `./data/ov.conf` 里给 `bot.ov_server.api_key` 填上 User Key，再把 compose 里的 `OPENVIKING_WITH_BOT` 改成 `1`，重启应用。

**给公网访问 / 上 HTTPS。**
用 1Panel 反代到安装时设的端口，并把 `ov.conf` 里的 `server.public_base_url` 填成外部 HTTPS 地址。按需把 `server.cors_origins` 从 `*` 收紧到自己的域名。

## 5. 数据目录与升级

`./data` 挂到容器里的 `/app/.openviking`：

- `ov.conf`：服务配置（首次启动生成，权限 `600`，已存在时绝不覆盖）
- `ovcli.conf`：命令行配置
- `data/`：工作区，账号、资源、向量数据都在这里

升级步骤：先停应用，把整个 `./data` 备份下来（不要只备份 `ov.conf`），再升级、启动。本地向量后端不支持多个实例共享同一个工作区。图标来自官方仓库的 `docs/images/ov-logo-square.png`。

容器内端口固定 `1933`，宿主机端口在应用参数页改。

## 6. 它能做什么

- 一个文件系统装下知识、记忆、技能，都能用 `viking://` 路径访问。
- 目录级语义检索，可以只看某个项目或记忆子树，不用扫全库。
- 三级上下文加载：L0 摘要、L1 概览、L2 全文，先判断相关性再读全文。
- 会话可归档成可读的 Markdown，并自动抽取记忆。
- 多账号与用户隔离，可选资源 ACL，支持 API Key 认证。
- 提供 Python / Go / TypeScript SDK 和完整 HTTP API。

## 相关链接

- 官网：<https://openviking.ai/>
- 文档：<https://docs.openviking.ai/>
- GitHub：<https://github.com/volcengine/OpenViking>
- 部署指南：<https://docs.openviking.ai/en/guides/03-deployment>
- 配置指南：<https://docs.openviking.ai/en/guides/01-configuration>
