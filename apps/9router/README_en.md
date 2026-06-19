# 9Router

FREE AI Router & Token Saver. Connect to 40+ AI providers and 100+ models, works with Claude Code, Cursor, Codex, Copilot, Cline and more AI coding tools.

## Features

- RTK Token Saver - Auto-compress tool outputs, save 20-40% tokens per request
- Smart 3-Tier Fallback - Auto-route: Subscription → Cheap → Free, zero downtime
- Real-Time Quota Tracking - Live token count and reset countdown
- Multi-Account Support - Multiple accounts per provider for load balancing
- Format Translation - OpenAI ↔ Claude ↔ Gemini format conversion
- Support 40+ providers and 100+ models

## Usage

### Default Port

- Web UI: 20128

### URLs

- Dashboard: http://localhost:20128/dashboard
- OpenAI-compatible API: http://localhost:20128/v1

### Data Directory

Application data is stored in the `./data` directory, including SQLite database and automatic backups.

### Environment Variables

- `DATA_DIR` - Data directory path (fixed to /app/data in container)
- `PORT` - Service port (default 20128)
- `HOSTNAME` - Listen address (default 0.0.0.0)
- `DEBUG` - Debug mode (optional, set to true to enable)

## Links

- Website: https://9router.com
- GitHub: https://github.com/decolua/9router
- Documentation: https://github.com/decolua/9router/blob/master/README.md
