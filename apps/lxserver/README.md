# LXServer

LX Music Sync Server 增强版，一个基于 Node.js 的音乐同步服务器和 Web 播放器。

## 功能特点

- 现代化 Web 播放器，支持深色模式和多套主题皮肤
- 多源聚合搜索，支持各大音乐平台资源搜索与播放
- 全平台数据同步，完美适配 LX Music 桌面端与移动端
- Subsonic 协议支持，可配合音流、Feishin 等第三方客户端
- 全自动化缓存系统，自动保存歌词、链接及歌曲文件
- 歌词卡片分享功能，支持生成精美歌词海报
- 访问控制，支持播放器访问密码和管理员/用户权限管理
- 支持导入自定义音乐源脚本

## 使用说明

### 默认端口

- Web 播放器: 9527
- 管理后台: 9527

### 访问地址

- Web 播放器: http://your-ip:9527/music (可通过 `PLAYER_PATH` 修改)
- 同步管理后台: http://your-ip:9527 (可通过 `ADMIN_PATH` 修改)

### 默认账号密码

- 管理后台默认密码: 123456 (部署后请立即修改)

### 数据目录

应用数据存储在以下目录:

- `./data`: 同步快照、用户信息和系统设置核心数据
- `./logs`: 系统运行日志
- `./cache`: Web 播放器自动化缓存文件
- `./music`: 本地音乐库目录

## 环境变量配置

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| FRONTEND_PASSWORD | Web 管理界面访问密码 | 123456 |
| ENABLE_WEBPLAYER_AUTH | 是否启用 Web 播放器访问密码 | false |
| WEBPLAYER_PASSWORD | Web 播放器访问密码 | 123456 |
| PLAYER_PATH | Web 播放器访问路径 | /music |
| ADMIN_PATH | 后台管理界面访问路径 | (空) |
| DISABLE_TELEMETRY | 是否禁用匿名数据统计 | false |
| SUBSONIC_ENABLE | 是否启用 Subsonic 协议支持 | true |
| SUBSONIC_PATH | Subsonic API 访问路径 | /rest |

## 相关链接

- 官方网站: https://xcq0607.github.io/lxserver/
- GitHub: https://github.com/XCQ0607/lxserver
- 文档: https://xcq0607.github.io/lxserver/
- Docker Hub: https://hub.docker.com/r/xcq0607/lxserver
