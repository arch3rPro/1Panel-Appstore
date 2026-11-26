# OpenViking

OpenViking 是火山引擎开源的上下文数据库，用 `viking://` 文件系统管理 Agent 的知识、记忆和技能。本包使用官方镜像 `ghcr.io/volcengine/openviking`，提供 HTTP 服务、Web Studio 和 VikingBot（默认关闭）。固定版本为 `0.5.6`，另有会随上游变化的 `latest`；配置行为按上游 v0.5.6 核对。

## 安装参数

Embedding 与 VLM 分别配置接口类型、地址、Key 和模型名。两组可以来自不同厂商，也可以填写相同地址和 Key；空值不会继承另一组。没有共享模型预设。

先在自己的机器上生成系统管理 Key，再填入表单并妥善保存，不要发到日志或 issue：

```bash
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

| 字段 | 用途和条件 |
| --- | --- |
| HTTP 访问端口 | 宿主机访问端口，默认 `1933`；容器端口固定 `1933`，安装后可改映射 |
| 系统管理 API Key（Root） | 自备至少 32 字符的强随机 Key；仅用于管理，不是用户访问 Key，也不是外部模型 Key |
| Embedding 接口类型 | `openai`（OpenAI 兼容）、`volcengine`（火山方舟）或 `ollama`（兼容 Embedding 接口）；可选“未配置” |
| Embedding API 地址 | 此向量服务的完整 API base；启用这组时必填，按所选协议填写 |
| Embedding 服务 API Key | 只给向量服务使用；方舟必填，无鉴权兼容服务或 Ollama 可留空 |
| Embedding 模型名 | 服务实际提供的模型名或 endpoint ID；启用这组时必填 |
| Embedding 输出维度 | 模型实际输出的正整数；启用这组时必填，包接受 `1..65536`，不代表每个模型/后端都支持整个范围 |
| Embedding 输入类型 | 组启用后留空按 `text`。`multimodal` 需适配器和实际模型共同支持；Ollama Embedding 仅允许 `text` |
| VLM 接口类型（摘要/对话/视觉） | `openai`（OpenAI 兼容）或 `volcengine`（方舟）；可选“未配置” |
| VLM API 地址 | 只给摘要/对话/视觉模型使用；启用这组时必填 |
| VLM 服务 API Key | 与 Embedding 独立；方舟必填，无鉴权兼容服务可留空 |
| VLM 模型名（摘要/对话/视觉） | 实际模型名或 endpoint ID；启用这组时必填。纯文本摘要不强制视觉能力，视觉或工具调用能力按任务确认 |

端口以外的参数仅用于**首次生成** `./data/ov.conf`，表单中设为安装后不可编辑。文件一旦存在，脚本不改字节、权限或其中的 Key、存储和其他配置。后续修改请用 Studio 的服务端配置文件模式，或编辑真实的 `./data/ov.conf` 再重启。修改安装环境变量不会覆盖已有文件。

表单没有条件隐藏。要启用某组，填写该组接口类型、地址、模型名，以及 Embedding 的实际维度；凭据是否必填按接口判断。两组校验全部通过才写文件，半组、非法维度或不支持的接口类型会报出字段名，不写半成品。脚本不测试网络、真实模型能力或旧集合兼容性。

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

按服务文档填写 base，脚本不统一追加 `/v1`。方舟原生适配器通常使用 `/api/v3`，不能机械套用 OpenAI 地址。这里的字段不涵盖 Azure 的 api_version、VikingDB 的 AK/SK、自定义请求头等完整上游能力，需要这些设置时使用完整 `ov.conf`。

无鉴权服务可留空 Key，但云服务仍需自己的有效凭据。v0.5.6 的 OpenAI Embedding 适配器在有 base 时可用内部占位；VLM 配置和 OpenAI SDK 要求非空 Key，因此本包仅在 `VLM_PROVIDER=openai` 且 Key 为空时写入 `no-key`。这不是实际密钥，不会让需要鉴权的服务免于鉴权，也不来自另一模型组。

### Ollama 的协议选择

若使用已准备好的 Ollama：Embedding 接口类型选 `ollama`，地址填容器可访问的 OpenAI 兼容 base，例如 `http://host.docker.internal:11434/v1`，模型名和实际维度自行核对，输入选 `text`。容器映射了 `host.docker.internal` 到宿主机；Ollama 的监听与网络访问仍需自行配置。

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

## 已有安装、模型更换与排障

已有 `ov.conf` 始终优先，包括旧版生成的文件。旧的 `MODEL_PRESET`、`MODEL_API_BASE`、`MODEL_API_KEY` 不再生成配置：compose 仅保留它们的可空映射用于识别迁移。若文件缺失且只有旧变量，脚本报迁移错误；请恢复备份的配置，或在部署环境中补齐新独立组。提供新组时忽略旧共享变量，不把旧地址或 Key 注入任一新组。旧变量里与新组同名的模型名/维度仍须配合对应 provider 等字段，不会自动猜测。

更换模型前备份完整数据目录，比较新旧脱敏配置，核对模型实际输出维度及已有集合 schema/embedding 元数据。同维度也可能不兼容；脚本不会重建索引或自动重嵌入。优先在真实配置中修改，保留服务端失败栈；Web 回滚本身不能说明根因。

遇到保存后重启回滚，收集失败时间窗的 stdout/stderr、保存前后脱敏配置差异、实际运行镜像与启动/挂载信息，以及集合 `collection_meta.json` 的向量维度和 embedding 元数据。`replay complete (0 records)` 仅表示此次增量重放计数，不等于集合或工作区没有数据。本次包修改不代表已定位或修复任何用户实例的回滚故障。

公网使用可通过 1Panel 反向代理配置 HTTPS，并按需设置 `server.public_base_url` 和限制 `server.cors_origins`。VikingBot 需要在真实配置中设置 `bot.ov_server.api_key`，再将 compose 的 `OPENVIKING_WITH_BOT` 改成 `1`；不要填 Root。

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
