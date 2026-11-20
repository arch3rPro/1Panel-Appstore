# LobeHub

[LobeHub](https://github.com/lobehub/lobehub) is an open-source AI agent platform with multi-model conversations, knowledge bases, multimodal interaction and tool calling. Data is stored on the server for access across devices.

## Features

- Connect OpenAI, Claude, Gemini, Ollama and other model providers.
- Upload files, search knowledge bases, and work with images and audio.
- Use web search, MCP tools and collaborative agents.
- Run server-side tasks through the Agent gateway and connect desktop/CLI devices through the device gateway.
- Built-in email/password authentication, with optional registration allowlists and SSO.

## Requirements

- Supports `amd64` and `arm64`.
- At least 2 CPU cores, 4 GB RAM and 20 GB free disk recommended; 4 cores and 8 GB RAM for regular use.
- Browsers and connected devices must be able to reach the application, S3 API and both gateways.

The package includes LobeHub, PostgreSQL, Redis, RustFS, SearXNG and gateway services. Database, Redis and search ports are not published to the host.

## Installation

When installing through 1Panel, replace `Your-IP` with the server's actual IP or domain. Ports can keep their defaults. If a port changes, update the corresponding public URL too.

| Setting | Default | Purpose |
| --- | --- | --- |
| Application URL | `http://Your-IP:3210` | Must match the browser's actual scheme, host and port; no path or trailing slash |
| S3 URL | `http://Your-IP:9000` | Browser uploads and downloads |
| Agent gateway URL | `http://Your-IP:8787` | Server-side agent execution and streaming |
| Device gateway URL | `http://Your-IP:8788` | Desktop and CLI device connections |
| RustFS console port | `9001` | Storage administration; restrict to trusted networks |
| Registration email allowlist | Empty | Empty allows any email; supports full email addresses or domains, separated by commas |

Database/storage passwords and authentication keys are generated automatically. A successful exit (code 0) from the one-shot `rustfs-init` container is normal.

### Domains and HTTPS

Use HTTPS in production and configure reverse proxies for all four public services:

| Service | Example | Default target port |
| --- | --- | --- |
| LobeHub | `https://lobe.example.com` | `3210` |
| S3 | `https://s3.example.com` | `9000` |
| Agent gateway | `https://agent.example.com` | `8787` |
| Device gateway | `https://device.example.com` | `8788` |

- Set the installation URLs to their corresponding HTTPS addresses.
- The application proxy must forward the correct `Host`, `X-Forwarded-Host` and `X-Forwarded-Proto`.
- Enable WebSocket upgrades and suitable read timeouts on both gateway proxies.
- Use HTTPS for S3 and gateways when the application uses HTTPS to avoid mixed-content blocking.

## First use

1. Wait for database initialization and application startup.
2. Open the configured **application URL** and select Sign up.
3. Enter a valid email and an **8–64 character password**, then follow the on-screen instructions.
4. Add your model provider and API key in settings.

There are no predefined application credentials. Email/password registration is enabled by default without email verification or SMTP. Configure an email service only when enabling features such as email verification and password-reset emails; see the [authentication documentation](https://lobehub.com/docs/self-hosting/environment-variables/auth).

If an allowlist is configured, the registration email must match an address or domain in it. For example, `owner@example.com,company.com` permits the specified address and emails from `company.com`.

### Connect a device

After installing the LobeHub CLI on your device, connect using the configured device gateway:

```bash
lh connect --gateway https://device.example.com
```

### RustFS console

The console defaults to `http://server-ip:9001`, username `admin`. Its password is the `RUSTFS_SECRET_KEY` field in `data/secrets/state.json` inside the installed application directory. View credentials only through a trusted terminal. Do not publish them or expose the console port to the public internet.

## Data and backups

| Path | Contents |
| --- | --- |
| `data/postgresql/` | Users, conversations and knowledge-base database |
| `data/rustfs/` | Uploaded files and object storage |
| `data/redis/` | Redis persistence |
| `data/secrets/` | Database passwords, authentication/encryption keys and service credentials |
| `data/searxng-settings.yml` | Web search configuration |

**Back up `data/secrets/` together with application data.** Rebuilds and upgrades reuse saved credentials. Losing or changing the encryption key makes existing encrypted data unreadable.

From the installed application directory, back up the database:

```bash
docker compose exec -T postgresql sh -c 'pg_dump -U postgres "$POSTGRES_DB"' > lobehub.sql
```

Also save Compose, `.env` and the entire `data/` directory. Stop services or use consistent snapshots before copying database files directly. Back up before pulling image updates; restore matching databases, files and keys together.

Objects in the storage bucket can be read by anyone holding their URLs; do not treat it as private storage. Gateway in-flight state is held in memory, so restarting the gateway interrupts active tasks.

## Troubleshooting

### Registration or login fails

- The browser address must exactly match `APP_URL`, including HTTP/HTTPS, domain/IP and port. Do not leave `Your-IP` unchanged.
- Check that the registration allowlist permits your email or domain. Use ordinary commas as separators.
- Passwords must be 8–64 characters.
- Verify forwarded host/protocol headers if using a reverse proxy. After changing URLs, recreate the application container and clear old site cookies before retrying.
- If the problem persists, inspect the status/response of `/api/auth/sign-up/email` in browser developer tools and run `docker compose logs --tail=100 lobe`. Remove passwords, tokens and cookies before sharing diagnostics.

### Redis reports `NOAUTH Authentication required`

The connected Redis requires authentication, but the application has not supplied matching credentials. This package uses a dedicated Redis on its private network and must not connect to another application's Redis on the shared network. `REDIS_URL` should be `redis://${CONTAINER_NAME}-redis:6379`, not the ambiguous `redis://redis:6379`.

Run `docker compose exec redis redis-cli ping` from the installed directory; the package default should return `PONG`. If the dedicated Redis also returns `NOAUTH`, check whether a password was added to that service and configure the application's matching `REDIS_PASSWORD`. Do not disable authentication on other Redis instances.

### File uploads fail

Ensure the browser can reach `S3_ENDPOINT` and that its HTTP/HTTPS scheme is compatible with the application. After changing the application URL, refresh upload CORS from the installed application directory:

```bash
docker compose run --rm rustfs-init
```

## Links

- [Source repository](https://github.com/lobehub/lobehub)
- [Documentation](https://lobehub.com/docs)
- [Docker Compose deployment](https://lobehub.com/docs/self-hosting/platform/docker-compose)
- [Authentication configuration](https://lobehub.com/docs/self-hosting/environment-variables/auth)
