# 1Panel App Builder

这个目录提供 1Panel 本地应用商店打包辅助脚本。AI 使用入口是 `SKILL.md`，人工常用入口是下面几个脚本。

## 快速使用

```bash
cd /root/github/1Panel-Appstore/skills

# 从 compose 生成草稿，跳过图标下载
./scripts/generate-app.sh --app-key my-app --name MyApp --version 1.2.3 --icon-mode skip ./docker-compose.yml

# 多服务 compose 指定主服务
./scripts/generate-app.sh --service web --app-key my-app --name MyApp --version 1.2.3 --icon-mode skip ./docker-compose.yml

# 检查依赖
./scripts/generate-app.sh --check-deps

# 下载或复用图标
./scripts/download-icon.sh --mode cache-only my-app ../apps/my-app/logo.png
./scripts/download-icon.sh --mode required --url https://example.com/logo.png my-app ../apps/my-app/logo.png

# 验证应用
./scripts/validate-app.sh ../apps/my-app

# 验证 skills 工具链
./tests/run_all.sh
```

## 生成脚本

`scripts/generate-app.sh` 支持 GitHub URL、compose URL、本地 compose 文件和 `docker run` 命令。

GitHub URL 会按仓库默认分支、`main`、`master` 顺序尝试常见 compose 文件路径，例如 `docker-compose.yml`、`compose.yaml`、`deploy/docker-compose.yml`。如果没有找到 compose，会从 README 中尝试提取单行 `docker run` 命令作为草稿来源。

常用参数：

```text
--output <dir>       输出目录，默认 ./apps
--app-key <key>      指定应用目录名
--name <name>        指定应用显示名
--service <name>     指定多服务 compose 的主服务
--version <tag>      指定具体版本目录和镜像 tag
--icon-mode <mode>   auto|required|skip|cache-only
--icon-url <url>     使用指定图标 URL
--force              允许覆盖已有生成目录
--dry-run            只解析并输出结果，不写文件
--check-deps         只检查依赖工具
```

## 图标策略

脚本不会创建占位图。图标模式：

- `auto`: 优先缓存，缺失时尝试网络源；找不到也不阻塞生成。
- `skip`: 跳过图标处理，适合草稿生成。
- `cache-only`: 只读 `skills/.cache/icons`，不访问网络。
- `required`: 找不到有效图标时失败。

## 校验范围

`scripts/validate-app.sh` 会检查：

- 应用目录结构和必需文件。
- `additionalProperties.key` 是否等于目录名。
- `PANEL_APP_PORT_*` 是否在版本 `data.yml` 中定义。
- `latest/` 镜像是否使用 `latest` tag。
- `logo.png` 是否疑似 HTML/XML 错误响应。
- 1Panel 常见 compose 约束，如 `${CONTAINER_NAME}`、`1panel-network`、`createdBy: "Apps"`。

生成结果仍需要人工审查 metadata、README、架构、端口语义和多服务依赖。
