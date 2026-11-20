# TencentDB Agent Memory

腾讯云开源的 AI Agent 长期记忆服务，通过 L0 对话、L1 原子记忆、L2 场景归纳、L3 用户画像逐层沉淀上下文。本应用封装官方公开 Docker 镜像的完整三件套：

| 组件 | 镜像 | 默认宿主机端口 | 功能 |
| --- | --- | --- | --- |
| Memory Core | `agentmemory/memory-core` | 8420（仅本机） | 记忆内核、元数据与用户鉴权 |
| Memory Hub | `agentmemory/memory-hub` | 8125 / 8424 | Web 管理面板 / Knowledge API |
| Memory Proxy | `agentmemory/memory-proxy` | 8096 | LLM 转发、会话初始化与记忆注入 |

提供固定版本 `1.0.4` 和滚动版本 `latest`，三个镜像均支持 amd64 / arm64。默认使用本地 SQLite 和 BM25，不依赖 Redis、MongoDB、腾讯云向量数据库或 COS；需要另外提供模型 API。建议为三件套预留至少 4 GB 内存，实际用量请按工作负载评估。

## 安装配置

1. **记忆模型**：填写 OpenAI 兼容的 API 地址（如 `https://api.openai.com/v1`）、密钥和模型名；Core 与 Hub 共用这组配置，用于记忆抽取、摘要和知识处理。请选择支持所需上下文与输出长度的模型，第三方 API 可能产生费用。
2. **代理上游**：填写 Coding Agent 实际调用的模型 API 地址与密钥，可以与记忆模型不同。Proxy 按客户端请求转发模型名，不单独覆盖模型。
3. **提示词模式**：`code` 用于工程与团队协作；个人助手、聊天场景选 `chat`。
4. **管理员用户名/密钥**：用于首次初始化，密钥由 1Panel 随机生成，请保存。初始化后以 `data/core/.admin-key` 为准，修改表单不会轮换已有用户密钥。
5. **通信密钥**：Panel/Knowledge 服务密钥和 Proxy 管理 API 密钥均应使用随机长串，不要与用户密钥混用。

### 监听与对外地址（重要）

- 默认监听地址为 `127.0.0.1`，只允许服务器本机访问。可以先通过 SSH 转发体验：

  ```bash
  ssh -L 8125:127.0.0.1:8125 -L 8096:127.0.0.1:8096 user@服务器IP
  ```

- 面板、Knowledge 和 Proxy 要直接供局域网访问时，将监听地址改为服务器网卡 IP 或 `0.0.0.0`，并配置防火墙；**不建议直接暴露公网**。也可通过 1Panel 反向代理提供 HTTPS。Core 无论此项如何设置都只映射到本机。
- **客户端可访问的代理地址**：填客户端实际能访问的 URL（例如 `http://192.168.1.10:8096` 或代理 HTTPS 域名）。默认 `localhost` 仅供本机/SSH 转发使用；它用于面板生成接入地址，不是容器内部地址。
- **Knowledge 可达地址**：留空时自动使用 Hub 的容器内部地址，默认记忆/知识链路无需开放宿主机端口。若工具还需要从其他机器调用，填写所有调用方（包括 Core 容器）都能访问的服务器地址/HTTPS 域名，必须以 `/v3` 结尾，并放通对应入口；如 `http://192.168.1.10:8424/v3`。修改对外端口时也要同步修改此 URL。
- 容器访问宿主机上的模型服务可使用 `host.docker.internal`；宿主机模型服务必须监听容器可达地址。

## 首次使用

1. 等待三个容器健康。Core 启动脚本会创建管理员并校验密钥，成功后才启动 Hub 和 Proxy。
2. 访问 `http://127.0.0.1:8125`（或你配置的面板入口），选择 `default` 实例，使用管理员用户名和用户密钥登录。
3. 在面板创建团队、Agent、任务和普通用户，按面板的“客户端接入地址”连接 Coding Agent。接入路径需要实例/客户端前缀，请勿直接假设裸 `/v1` 可用。
4. Proxy 已启用 `auth`、`sessionInit`、`tdai` 及 skill/knowledge/tdai-memory 注入器；客户端应按上游接入说明传递用户密钥（如 `x-tdai-user-key`）。不要把模型供应商密钥当成平台用户密钥。

管理员密钥保存在应用实际安装目录下的 `data/core/.admin-key`。也可在服务器本机校验，注意不要将真实密钥写入公开日志：

```bash
curl http://127.0.0.1:8420/health
curl http://127.0.0.1:8125/health
curl http://127.0.0.1:8424/health
curl http://127.0.0.1:8096/health
```

健康检查仅验证服务存活与管理员初始化，不能保证模型调用、知识导入或记忆抽取成功，请用实际会话进一步验证。

## 持久化与更新

```text
data/
├── core/                # SQLite、记忆文件、.admin-key
├── hub/                 # Knowledge SQLite、知识文件、SSH 密钥与日志
├── proxy/               # Proxy SQLite
└── scripts/             # 1Panel 启动适配脚本，勿删除
```

- Core 与 Proxy 的临时配置由脚本在每次启动时从表单环境变量安全序列化生成，不在 YAML 中直接拼接密钥。修改模型参数后，在 1Panel 保存并重建/更新容器以应用新环境变量，仅普通重启不能更新环境变量。
- Proxy 挂载目录由启动脚本准备，再降权到 uid/gid `10001` 运行应用；无需手工执行 `chmod 777`。
- 升级前停止整套应用，备份整个 `data/`、Compose 与安装环境变量。数据库和 `.admin-key` 必须匹配恢复。
- 推荐生产固定 `1.0.4`；`latest` 为滚动标签，可能发生不兼容变更。不要并发启动多个实例共享 SQLite 数据目录。

## 安全与上游限制

当前上游 Proxy 的 `auth/verify` 调用不发送 Core Gateway Bearer。为兼容完整链路，本包关闭 Core Gateway Bearer，将 Core 仅接入每次安装独立的 `memory-stack` 网络，而不接入共享 `1panel-network`；Hub 与 Proxy 同时接入两者。**不要将 Core API 反向代理到公网。** `local` 只是内部功能门槛标记，不是安全密钥。

Knowledge 写入/管理接口使用服务密钥，但部分查询接口公开；Proxy 管理入口受独立管理密钥保护。用户鉴权不等于所有 HTTP 路由均受保护，公网部署前需自行审计入口并添加额外访问控制。CostGuard 私有模块默认关闭。MongoDB、云存储及多副本服务模式不在本包范围内。

## 来源

- 项目：<https://github.com/TencentCloud/TencentDB-Agent-Memory>
- 官方部署脚本：<https://github.com/TencentCloud/TencentDB-Agent-Memory/tree/feat/server_team/deploy/global-images>
- 镜像：<https://hub.docker.com/u/agentmemory>
- 封装参考源码：`ecc01a545da0b2ac6cae2f0f0af0d39d41469793`；图标取自官方 `MemoryPanel/web/public/logo.png`。
