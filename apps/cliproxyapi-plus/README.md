# CLIProxyAPI Plus

CLIProxyAPI Plus 是 CLIProxyAPI 的增强版本，在主线项目基础上添加了第三方提供商支持。所有第三方提供商支持由社区贡献者维护。

## 功能特点

- 支持多种 AI 模型提供商（Claude、Gemini、Codex、Qwen 等）
- 支持第三方提供商扩展
- OAuth 认证支持
- 高性能代理设计
- Web 管理界面
- 灵活的路由和负载均衡策略

## 使用说明

### 默认端口

- **Web UI 端口 (8317)**: 主要的 Web 管理界面和 API 端口
  - Web 管理界面: `http://localhost:8317/management.html`
  - API 端点: `http://localhost:8317/v1`
- **代理端口 (8085)**: 代理服务端口
- **额外端口**: 1455, 54545, 51121, 11451（用于特定功能扩展）

### Web 管理界面

部署后，访问 Web 管理界面需要以下步骤：

1. **编辑配置文件** `./data/config.yaml`
   - 将 `remote-management.allow-remote` 设置为 `true` 以允许远程访问
   - 设置 `remote-management.secret-key` 为您的管理密钥

2. **访问地址**（替换为您的服务器 IP）：

```
http://your-server-ip:8317/management.html
```

**注意**：默认 `allow-remote` 为 `false`，仅允许本地访问。如需从其他机器访问，请务必设置为 `true` 并配置强密码。

### 配置文件

应用数据存储在 `./data` 目录，包含：

- `config.yaml` - 主配置文件
  - API 密钥配置
  - 提供商设置
  - 路由策略
  - 代理设置
- `auths/` - OAuth 认证信息存储目录
- `logs/` - 应用日志目录

### 快速配置

1. 编辑 `./data/config.yaml` 文件
2. 在 `api-keys` 部分添加您的 API 密钥
3. 如需远程访问，设置 `remote-management.allow-remote: true` 和 `remote-management.secret-key`
4. 根据需要配置各个提供商（Claude、Gemini、Codex 等）
5. 重启应用使配置生效

### 主要配置项

```yaml
# API 密钥
api-keys:
  - 'your-api-key-1'
  - 'your-api-key-2'

# 管理界面设置
remote-management:
  allow-remote: false        # 是否允许远程管理，true=允许，false=仅本地
  secret-key: ''             # 管理密钥（首次启动后会被哈希）
  disable-control-panel: false

# 代理设置
proxy-url: ""                # 全局代理 URL

# 路由策略
routing:
  strategy: 'round-robin'    # round-robin 或 fill-first
```

## 版本说明

- **latest**: 最新开发版本
- **6.9.9-0**: 最新稳定版本（推荐）

## 相关链接

- 官方文档: https://help.router-for.me/cn/introduction/quick-start.html
- Web UI 文档: https://help.router-for.me/cn/management/webui.html
- GitHub: https://github.com/router-for-me/CLIProxyAPIPlus
- 问题反馈: https://github.com/router-for-me/CLIProxyAPIPlus/issues

## 注意事项

1. 首次部署后请及时修改 `api-keys` 和管理密钥
2. 如需远程访问，请设置 `allow-remote: true` 并配置强密码
3. 生产环境建议在使用完毕后将 `allow-remote` 改回 `false` 以提高安全性
4. 如需使用 OAuth 认证，请确保 `auths/` 目录有正确的读写权限
5. 生产环境建议配置 TLS 加密

## 技术支持

- 主线项目问题: 请在主线仓库提交 Issue
- Plus 版本第三方提供商问题: 请联系相应的社区维护者
