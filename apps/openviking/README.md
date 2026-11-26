# OpenViking

OpenViking 是火山引擎开源的上下文数据库，用 `viking://` 文件系统管理 Agent 的知识、记忆和技能。本包使用官方镜像 `ghcr.io/volcengine/openviking`，提供 HTTP 服务、Web Studio 和 VikingBot（默认关闭）。固定版本为 `0.5.6`，另有会随上游变化的 `latest`；配置行为按上游 v0.5.6 核对。

## 安装参数

Embedding 与 VLM 分别配置接口类型、地址、Key 和模型名。两组可以来自不同厂商，也可以填写相同地址和 Key；空值不会继承另一组。没有共享模型预设。

系统管理 Key 可自行设置，也可在自己的机器上生成随机值后填入表单：

```bash
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

| 字段 | 用途和条件 |
| --- | --- |
| HTTP 访问端口 | 宿主机访问端口，默认 `1933`；容器端口固定 `1933`，安装后可改映射 |
| 系统管理 API Key（Root） | 必填，用于服务配置、账号和用户管理 |
| Embedding 接口类型 | `openai`（OpenAI 兼容）、`volcengine`（火山方舟）或 `ollama`（兼容 Embedding 接口）；可选“未配置” |
| Embedding API 地址 | 自定义服务填写 API base；OpenAI、方舟留空使用官方地址，Ollama 留空连接宿主机 `11434/v1` |
| Embedding 服务 API Key | 只给向量服务使用；方舟必填，无鉴权兼容服务或 Ollama 可留空 |
| Embedding 模型名 | 服务实际提供的模型名或 endpoint ID；启用这组时必填 |
| Embedding 输出维度 | 启用这组时填写模型实际输出维度，使用正整数 |
| Embedding 输入类型 | 组启用后留空按 `text`。`multimodal` 需适配器和实际模型共同支持；Ollama Embedding 仅允许 `text` |
| VLM 接口类型（摘要/对话/视觉） | `openai`（OpenAI 兼容）或 `volcengine`（方舟）；可选“未配置” |
| VLM API 地址 | 自定义服务填写 API base；OpenAI、方舟留空使用官方地址 |
| VLM 服务 API Key | 与 Embedding 独立；方舟必填，无鉴权兼容服务可留空 |
| VLM 模型名（摘要/对话/视觉） | 实际模型名或 endpoint ID；启用这组时必填。纯文本摘要不强制视觉能力，视觉或工具调用能力按任务确认 |

端口以外的参数仅用于**首次生成** `./data/ov.conf`，表单中设为安装后不可编辑。文件一旦存在，脚本不改字节、权限或其中的 Key、存储和其他配置。后续修改请用 Studio 的服务端配置文件模式，或编辑真实的 `./data/ov.conf` 再重启。修改安装环境变量不会覆盖已有文件。

配置 Embedding 时填写接口类型、模型名和实际维度；配置 VLM 时填写接口类型和模型名。使用 OpenAI 或方舟官方服务时填写各自的 Key，API 地址可留空。自建服务填写其地址，凭据按服务要求填写。

### 两个自定义 OpenAI 兼容服务

下面是填表模板，尖括号必须替换；模型名由各自的服务决定，不预置任意模型或通用维度：

| 字段 | Embedding 组 | VLM 组 |
| --- | --- | --- |
| 接口类型 | `openai` | `openai` |
| API 地址 | `<向量服务文档规定的 OpenAI 兼容 base>` | `<对话服务文档规定的 OpenAI 兼容 base>` |
| API Key | `<向量服务 Key；无鉴权服务可空>` | `<对话服务 Key；无鉴权服务可空>` |
| 模型名 | `<实际向量模型名>` | `<实际摘要/对话/视觉模型名>` |
| 输出维度 | `<实际向量长度，填写整数>` | 无此字段 |
| 输入类型 | `text`，或服务明确支持时填 `multimodal` | 无此字段 |

自定义 base 按服务文档填写，使用完整路径。OpenAI 和方舟官方服务可省略地址，由各自适配器使用默认值；方舟通常使用 `/api/v3`。Azure 的 api_version、VikingDB 的 AK/SK、自定义请求头等设置通过 `ov.conf` 配置。

无鉴权服务可留空 Key，但云服务仍需自己的有效凭据。v0.5.6 的 OpenAI Embedding 适配器在有 base 时可用内部占位；VLM 配置和 OpenAI SDK 要求非空 Key，因此本包仅在 `VLM_PROVIDER=openai` 且 Key 为空时写入 `no-key`。这不是实际密钥，不会让需要鉴权的服务免于鉴权，也不来自另一模型组。

### Ollama 的协议选择

若使用已准备好的 Ollama：Embedding 接口类型选 `ollama`，地址留空时连接 `http://host.docker.internal:11434/v1`；其他实例填写其 OpenAI 兼容 base。填写模型名和实际维度，输入选 `text`。容器通过 `host.docker.internal` 访问宿主机，Ollama 需允许容器连接。

VLM 接口类型选 **`openai`**，地址独立填写该 Ollama 服务的 `/v1` 兼容 base，模型须支持所用的 chat/vision/tools 功能。此时走上游 OpenAIVLM 与 OpenAI 兼容协议，**不走 LiteLLM 的原生 `ollama/` 路由**。两组可连接不同 Ollama 实例；不要把原生 `/api/chat` 地址填成兼容 API base。表单不提供原生 Ollama VLM 选项。

这只说明生成的适配器与地址映射，未执行真实 Ollama 请求或完整容器启动。

### 暂不配置模型

把某组的所有字段都留空，可只配置另一组；两组都留空时，脚本仍可生成含管理 Key、监听和本地存储的基础配置。选择“未配置”却填写同组其他字段属于半组，会报错。

**这条路径未经完整 HTTP/Studio 启动验证。** 不写 Embedding 段时，上游 v0.5.6 会启用默认 `local`、512 维模型，不等于关闭向量。标准镜像的构建依赖链未选择 `local-embed`，本次未核验镜像内已安装包；不能保证默认 local 可用。未配 VLM 时摘要/对话/视觉功能也不能视为可用。

默认集合可能先按 512 维创建，之后换 Embedding 仍受已有集合维度/元数据检查约束。建议在导入资料前确认实际要使用的模型与维度。不要靠删工作区绕过检查，不写 v0.5.6 不存在的 `enable_default_resources`。

## 使用与验证

完整服务成功启动后，打开 `http://<服务器地址>:<HTTP访问端口>/studio/`。Studio 使用 API Key 连接，不是 `root` 账号加密码：

- 系统管理 API Key（Root）：服务配置、账号与用户等控制面管理。
- 用户访问 API Key（User/Admin）：创建账号/用户后取得，供日常资料读写、CLI/SDK 检索使用；Root 不能替代数据身份。
- Embedding/VLM 服务 API Key：分别调用两个外部模型服务，与前两类身份无关。

需要管理初始化时，在 Studio 相应管理连接中使用 Root；保存创建得到的用户 Key，日常工作台和数据接口使用该用户身份。Bot 默认关闭，启用前也需要适当的 User/Admin 数据访问 Key。

`/health` 说明服务存活；`/ready` 检查初始化、存储等条件，但其中 Embedding 子检查只看 provider 对象存在，不实际调用模型。不能以 healthy 或 ready 推断模型正确。

Studio 的连接测试检查当次草稿的单次请求；保存执行配置校验；两者都不保证新配置能完成启动或兼容旧集合。`openviking-server doctor` 可补充 Embedding 诊断，VLM 的 PASS 不能直接当成真实 VLM 请求成功。最终还需以实际导入、后台任务结果和检索核验业务。本包本轮只做本地脚本与配置模块验证，未进行这些运行测试。

没有 `ov.conf` 时，官方入口的等待服务对所有路径返回 pending `503`，不是 Studio。当前脚本会生成基础文件或在参数错误时退出，不应把这两种状态混为“界面已启动”。

## 启用 VikingBot

Bot 已包含在官方镜像中，本包默认关闭。以下适用于已在 API Key 模式下正常运行的服务：

1. 在 Studio 使用 Root 管理身份创建账号和用户，保存该用户的 User/Admin API Key。Bot 访问资料需要这个用户 Key，不能只填 Root。
2. 备份实际挂载的 `./data/ov.conf`，将下列字段合并进去：在现有 `server` 内增加 `with_bot`，在 `bot.ov_server` 内填写用户凭据。保留原有 host、port、Root Key、模型、存储及其他配置，**不要用此片段替换整个文件**。

   ```json
   {
     "server": {"with_bot": true},
     "bot": {
       "ov_server": {
         "api_key_type": "user",
         "api_key": "<User/Admin 用户访问 Key>"
       }
     }
   }
   ```

3. Bot 默认继承根 `vlm`，确认该对话模型支持任务所需的工具调用即可，无需另配第三套模型。显式配置 `bot.agents.model` 或 `bot.agents.credentials` 时才使用独立 Bot 模型。
4. 保存后在 1Panel 重启应用，再以用户身份进入 Studio 的 VikingBot 页面测试对话。启动日志中可查看 `Vikingbot gateway started`，并以页面实际回复核验。

开关统一用 `server.with_bot`；compose 的 `OPENVIKING_WITH_BOT` 保持 `0`，无需同时修改，也无需额外映射 Bot 端口，服务会通过现有 HTTP 端口代理。停用时将 `server.with_bot` 改为 `false` 并重启。启用失败可恢复备份，保留启动日志按实际异常排查，不清工作区。

## 已有安装、模型更换与排障

已有 `ov.conf` 始终优先，包括旧版生成的文件。旧的 `MODEL_PRESET`、`MODEL_API_BASE`、`MODEL_API_KEY` 不再生成配置：compose 仅保留它们的可空映射用于识别迁移。若文件缺失且只有旧变量，脚本报迁移错误；请恢复备份的配置，或在部署环境中补齐新独立组。提供新组时忽略旧共享变量，不把旧地址或 Key 注入任一新组。旧变量里与新组同名的模型名/维度仍须配合对应 provider 等字段，不会自动猜测。

更换模型前备份完整数据目录，比较新旧脱敏配置，核对模型实际输出维度及已有集合 schema/embedding 元数据。同维度也可能不兼容；脚本不会重建索引或自动重嵌入。优先在真实配置中修改，保留服务端失败栈；Web 回滚本身不能说明根因。

遇到保存后重启回滚，收集失败时间窗的 stdout/stderr、保存前后脱敏配置差异、实际运行镜像与启动/挂载信息，以及集合 `collection_meta.json` 的向量维度和 embedding 元数据。`replay complete (0 records)` 仅表示此次增量重放计数，不等于集合或工作区没有数据。本次包修改不代表已定位或修复任何用户实例的回滚故障。

公网使用可通过 1Panel 反向代理配置 HTTPS，并按需设置 `server.public_base_url` 和限制 `server.cors_origins`。

如需上游终端向导，可先备份配置，再手动运行 `docker exec -it <容器名> openviking-server init`；它需要交互，不接入自动启动脚本。

## 数据与升级

相对应用目录 `./data` 挂载到容器 `/app/.openviking`：

- `./data/ov.conf`：服务配置，新建时原子发布为 `600`，已存在时不覆盖。
- `./data/ovcli.conf`：CLI 配置。
- `./data/data`：工作区，对应容器 `/app/.openviking/data`，包含账号/用户凭据、资料、向量与队列。
- `./data/scripts`：本包启动脚本。

升级前停止应用并备份整个 `./data`。保留旧配置与工作区，不让多个使用本地向量后端的实例同时共享工作区。不得将 `./data/data` 当成可随意清理的空索引目录。

若 ghcr.io 不可达，compose 保留了同 tag 的内地镜像注释，可按需切换。第三方镜像的安全性、可用性与合规风险由使用者自行评估。本包未通过拉镜像或起容器验证运行效果。

图标来自上游仓库 `docs/images/ov-logo-square.png`。OpenViking 的作者与许可证以[上游仓库](https://github.com/volcengine/OpenViking)为准。

## 链接

- 官网：<https://openviking.ai/>
- 文档：<https://docs.openviking.ai/>
- GitHub：<https://github.com/volcengine/OpenViking>
- [v0.5.6 部署说明](https://github.com/volcengine/OpenViking/blob/831ad81f5838d3502812a48bbec2e1d2930ed13c/docs/zh/guides/03-deployment.md)
- [v0.5.6 配置说明](https://github.com/volcengine/OpenViking/blob/831ad81f5838d3502812a48bbec2e1d2930ed13c/docs/zh/guides/01-configuration.md)
