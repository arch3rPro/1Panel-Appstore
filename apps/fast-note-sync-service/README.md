# Fast Note Sync Service

Fast Note Sync Service 是一个高性能、低延迟的 Obsidian 笔记同步、在线管理与 REST API 服务平台，基于 Go、WebSocket 和 React 构建。

## 功能特点

- 支持 Obsidian 笔记、目录、配置和附件同步
- 提供 Web 管理面板，可创建用户、管理仓库并查看笔记内容
- 支持 REST API、MCP、分享、历史版本、回收站和多存储备份
- 支持 SQLite、MySQL 和 PostgreSQL 等数据库配置

## 使用说明

### 默认端口

- Web 管理面板 / API / WebSocket: 9000

### 初始账号

- 首次访问 `http://服务器IP:9000` 后注册第一个账号
- 如需关闭公开注册，请在配置文件中设置 `user.register-is-enable: false`

### 数据目录

- 笔记与附件数据: `./data/storage`
- 配置文件: `./data/config`

### 客户端配置

登录 Web 管理面板后，点击“复制 API 配置”，并粘贴到 Obsidian Fast Note Sync 插件设置中。

## 相关链接

- GitHub: https://github.com/haierkeys/fast-note-sync-service
- Obsidian 插件: https://github.com/haierkeys/obsidian-fast-note-sync
- REST API 文档: https://github.com/haierkeys/fast-note-sync-service/blob/master/docs/REST_API.md
