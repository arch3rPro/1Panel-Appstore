# Claude Code Hub

Intelligent AI API Gateway and Management Platform for unified multi-provider access, elastic scheduling, and refined operations.

## Features

- 🤖 **Intelligent Load Balancing**: Weight + priority + group scheduling with built-in circuit breaker protection and up to 3 failover attempts
- 🧩 **Multi-Provider Management**: Support for Claude, Codex, Gemini CLI, OpenAI Compatible with custom model redirection and HTTP/HTTPS/SOCKS proxy
- 🛡️ **Rate Limiting & Concurrency Control**: Multi-dimensional limits including RPM, cost (5h/weekly/monthly), concurrent sessions with Redis Lua scripts for atomic operations
- 📘 **Auto-generated OpenAPI Documentation**: 39 REST endpoints with OpenAPI 3.1.0, Swagger + Scalar UI interfaces
- 📊 **Real-time Monitoring & Statistics**: Dashboard, active sessions, consumption leaderboard, decision chain records, proxy status tracking
- 💰 **Price Table Management**: Paginated queries with SQL optimization, search debouncing, LiteLLM sync support
- 🔁 **Session Management**: 5-minute context cache with decision chain recording for full audit trail
- 🔄 **OpenAI Compatible Endpoints**: Support for `/v1/chat/completions` with tool calling and reasoning field passthrough

## Usage

### Default Port

- Web UI: 23000

### Default Credentials

- Admin Token: Set the `ADMIN_TOKEN` environment variable during deployment (must be changed)

### Data Directory

Application data is stored in the `./data` directory:

- PostgreSQL data: `./data/postgres`
- Redis data: `./data/redis`

### Environment Variables

#### Required Configuration

- `ADMIN_TOKEN`: Admin login token (must be changed)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

#### Optional Configuration

- `ENABLE_RATE_LIMIT`: Enable rate limiting (default: true)
- `SESSION_TTL`: Session TTL in seconds (default: 300)
- `AUTO_MIGRATE`: Auto-execute database migrations (default: true)
- `ENABLE_SECURE_COOKIES`: Enable secure cookies (default: false)
  - **Important**: Keep as `false` if deploying with HTTP (not HTTPS)
  - If deploying with HTTPS, it's recommended to set to `true` for better security
  - When set to `true`, browsers will refuse to set cookies over HTTP connections, preventing login

### Access the Application

After successful deployment, access the application at:

- **Dashboard**: `http://localhost:23000` (login with `ADMIN_TOKEN`)
- **API Docs (Scalar UI)**: `http://localhost:23000/api/actions/scalar`
- **API Docs (Swagger UI)**: `http://localhost:23000/api/actions/docs`

## Links

- Website: https://github.com/ding113/claude-code-hub
- GitHub: https://github.com/ding113/claude-code-hub
- Documentation: https://github.com/ding113/claude-code-hub/blob/main/README.md

## Tech Stack

- **Framework**: Next.js 15 + Hono
- **Database**: PostgreSQL 18
- **Cache**: Redis 7
- **Runtime**: Node.js / Bun
- **Language**: TypeScript
