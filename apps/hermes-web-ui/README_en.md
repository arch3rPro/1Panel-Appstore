# Hermes Web UI

A full-featured web dashboard for Hermes Agent. Manage AI chat sessions, monitor usage & costs, configure platform channels, schedule cron jobs, browse skills — all from a clean, responsive web interface.

## Features

- **AI Chat** — Real-time streaming via SSE, multi-session management, Markdown rendering with syntax highlighting
- **Platform Channels** — Unified configuration for 8 platforms (Telegram, Discord, Slack, WhatsApp, Matrix, Feishu, WeChat, WeCom)
- **Usage Analytics** — Token usage breakdown, cost tracking, model distribution charts
- **Scheduled Jobs** — Create, edit, pause, resume, delete cron jobs
- **Model Management** — Auto-discover providers, add custom OpenAI-compatible endpoints
- **Multi-Profile** — Create, clone, import/export Hermes profiles
- **File Browser** — Browse, upload, download files on remote backends
- **Group Chat** — Multi-agent chat rooms with @mention support and context compression
- **Skills & Memory** — Browse installed skills, user notes management
- **Log Viewer** — Filter and view agent/gateway/error logs
- **Authentication** — Token-based auth (auto-generated on first run)
- **Web Terminal** — Integrated terminal with multi-session support

## Usage

### Architecture

This app includes two services:
- **hermes-agent**: Uses the official 1Panel-maintained Hermes Agent image ([1panel/hermes-agent](https://hub.docker.com/r/1panel/hermes-agent))
- **hermes-webui**: Community-maintained full-featured web dashboard

### Default Port

- Web UI: `6060` (configurable during installation)

### Default Credentials

- Auth Token is auto-generated on first run. View it via container logs:
  ```bash
  docker logs <container-name> | grep token
  ```
- You can also set a custom token via `AUTH_TOKEN` environment variable
- Set `AUTH_DISABLED=true` to disable authentication

### Data Directories

- `./data` — Hermes Agent runtime data (sessions, configs, profiles)
- `./webui-data` — Web UI data (auth token, etc.)

### Prerequisites

Make sure to configure your AI model API keys via the Web UI's Model Management page before use.

## Links

- Hermes Web UI: https://github.com/EKKOLearnAI/hermes-web-ui
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- Official 1Panel Hermes Agent: https://github.com/1Panel-dev/appstore/tree/dev/apps/hermes-agent