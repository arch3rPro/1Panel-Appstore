# WeRSS 微信公众号订阅助手

WeRSS 是一个用于订阅和管理微信公众号内容的工具，提供 RSS 订阅功能。

## 主要功能

- 微信公众号内容抓取和解析
- RSS 订阅生成
- 用户友好的 Web 管理界面
- 定时自动更新内容
- 支持多种数据库（默认 SQLite，可选 MySQL）
- 多主题切换（13 种主题）
- 级联系统：支持父子节点架构，智能任务分发
- 支持自定义通知渠道（钉钉、企业微信、飞书、自定义 Webhook）
- 支持导出 md/docx/pdf/json 格式
- 支持 API 接口调用 / WebHook 调用

## 部署说明

- 默认使用 SQLite 数据库，数据持久化在 `./data` 目录。
- 默认管理员账号：`admin`，密码：`admin@123`，请在安装后及时修改。
- 安装完成后访问 `http://<服务器IP>:<端口>` 开始使用。

## 配置项

| 参数名 | 说明 | 默认值 |
| --- | --- | --- |
| `PANEL_APP_PORT_HTTP` | Web 访问端口 | `8001` |
| `PANEL_APP_USERNAME` | 管理员用户名 | `admin` |
| `PANEL_APP_PASSWORD` | 管理员密码 | `admin@123` |

## 文档

更多信息请参考 [官方仓库](https://github.com/rachelos/we-mp-rss)。
