# Codex Universal

OpenAI Codex 的基础 Docker 镜像，提供完整的开发环境。

## 功能特点

- **多语言支持**：内置 Python、Node.js、Rust、Go、Swift、Ruby、PHP、Java 等多种编程语言运行时
- **开发工具**：预配置 pyenv、poetry、uv、ruff、black、mypy、pyright、isort、corepack、yarn、pnpm、npm 等常用开发工具
- **额外工具**：包含 bun、bazelisk/bazel、erlang、elixir 等工具
- **灵活配置**：通过环境变量轻松配置各语言版本
- **跨平台**：支持 linux/amd64 和 linux/arm64 架构

## 支持的语言版本

### Python
- 3.14.0, 3.13, 3.12, 3.11.12, 3.10

### Node.js
- 22, 20, 18

### Rust
- 1.93.0, 1.92.0, 1.91.1, 1.90, 1.89.0, 1.88.0, 1.87.0, 1.86.0, 1.85.1, 1.84.1, 1.83.0

### Go
- 1.25.1, 1.24.3, 1.23.8, 1.22.12

### Swift
- 6.2, 6.1, 5.10

### Ruby
- 3.4.4, 3.3.8, 3.2.3

### PHP
- 8.4, 8.3, 8.2

### Java
- 25, 24, 23, 22, 21, 17, 11

## 使用说明

### 数据目录

- 应用工作目录挂载在 `./data`，可以在这里存放项目代码
- 容器默认工作目录为 `/workspace`

### 如何使用

1. 部署容器后，可以通过 1Panel 的终端功能进入容器
2. 或者使用命令 `docker exec -it <容器名> bash` 进入容器
3. 在容器内进行开发工作

## 相关链接

- 官方网站: https://github.com/openai/codex-universal
- GitHub: https://github.com/openai/codex-universal
