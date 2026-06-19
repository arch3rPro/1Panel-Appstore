# Codex Universal

Base Docker image used in OpenAI Codex environments.

## Features

- **Multi-language support**: Built-in Python, Node.js, Rust, Go, Swift, Ruby, PHP, Java and more programming language runtimes
- **Development tools**: Pre-configured with pyenv, poetry, uv, ruff, black, mypy, pyright, isort, corepack, yarn, pnpm, npm and other common development tools
- **Additional tools**: Includes bun, bazelisk/bazel, erlang, elixir and more
- **Flexible configuration**: Easily configure language versions via environment variables
- **Cross-platform**: Supports linux/amd64 and linux/arm64 architectures

## Supported Language Versions

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

## Usage

### Data Directory

- Application workspace is mounted at `./data`, you can store project code here
- Container default working directory is `/workspace`

### How to Use

1. After deploying the container, you can access it via 1Panel's terminal feature
2. Or use the command `docker exec -it <container-name> bash` to enter the container
3. Perform development work inside the container

## Links

- Website: https://github.com/openai/codex-universal
- GitHub: https://github.com/openai/codex-universal
