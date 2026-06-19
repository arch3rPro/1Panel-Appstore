# 使用示例

## 从本地 compose 生成草稿

```bash
cd /root/github/1Panel-Appstore/skills

./scripts/generate-app.sh \
  --app-key demo-app \
  --name DemoApp \
  --service web \
  --version 1.25.3 \
  --icon-mode skip \
  --output ../apps \
  /tmp/demo-compose.yml
```

生成结构：

```text
../apps/demo-app/
├── data.yml
├── README.md
├── README_en.md
├── latest/
│   ├── data.yml
│   └── docker-compose.yml
└── 1.25.3/
    ├── data.yml
    └── docker-compose.yml
```

`latest/docker-compose.yml` 使用 `image: ...:latest`，`1.25.3/docker-compose.yml` 使用 `image: ...:1.25.3`。

## docker run 输入

```bash
./scripts/generate-app.sh \
  --app-key nginx-demo \
  --name NginxDemo \
  --version 1.25.3 \
  --icon-mode cache-only \
  "docker run -d --name nginx-demo -p 8080:80 -v ./data/html:/usr/share/nginx/html nginx:1.25.3"
```

脚本会解析：

- `--name` 作为服务名候选。
- `-p/--publish` 生成 `PANEL_APP_PORT_*` 表单字段。
- `-v/--volume` 保留到 compose 的 `volumes`。
- `-e/--env` 和 `--env-file` 保留到 compose。
- 镜像 tag 作为版本候选；显式 `--version` 优先。

## GitHub 输入

```bash
./scripts/generate-app.sh \
  --app-key github-demo \
  --name GitHubDemo \
  --service web \
  --version 1.2.3 \
  --icon-mode skip \
  https://github.com/example/demo
```

脚本会尝试仓库默认分支、`main`、`master` 下的常见 compose 路径；如果没有找到 compose，会从 README 中尝试提取单行 `docker run` 命令。生成结果仍需要人工审查。

## 图标处理

```bash
# 只使用缓存，不访问网络
./scripts/download-icon.sh --mode cache-only nginx ../apps/nginx-demo/logo.png

# 已知准确图标 URL 时强制下载，失败则退出非零
./scripts/download-icon.sh --mode required --url https://example.com/nginx.png nginx ../apps/nginx-demo/logo.png
```

脚本不会创建占位图。找不到真实图标时，应保留缺失状态并在交付说明中指出。

## 验证

```bash
./scripts/generate-app.sh --check-deps
./scripts/validate-app.sh ../apps/demo-app
./tests/run_all.sh
```

`validate-app.sh` 负责结构和常见规则检查；仍需要人工检查 README、分类标签、架构支持、默认端口和多服务依赖是否合理。
