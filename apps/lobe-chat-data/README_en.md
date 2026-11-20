# LobeHub (formerly LobeChat Database)

[LobeHub](https://github.com/lobehub/lobehub) is an open-source AI agent platform with multi-model chat, knowledge bases and server-side synchronization. The app key remains `lobe-chat-data`. This package was reviewed against upstream **v2.3.4**.

## Versions and upgrade warning

- `2.3.4`: recommended for new installations; main image `lobehub/lobehub:2.3.4`.
- `latest`: main image `lobehub/lobehub:latest`; future upstream changes may break compatibility.
- `1.143.3`: original LobeChat/Casdoor/MinIO package, preserved for reference, not a maintenance guarantee.

**Do not rebuild an existing 1.x installation with the new 2.x configuration.** The image, authentication system, database extensions and storage layout changed. Cross-version updates are disabled in app metadata. Old `latest` installations also require manual migration. Install/upgrade hooks refuse to proceed when the old `./data/PG_VERSION` layout is detected.

## Installation

Allow at least 2 CPU cores, 4 GB RAM and 20 GB disk; 4 cores and 8 GB RAM are recommended for production.

### Configure addresses

The form now contains **4 public URLs, 5 ports with defaults, and 1 optional email allowlist**. Both Agent and device gateways remain enabled. Database passwords, storage credentials and JWKS JSON no longer require manual input.

Replace `Your-IP` in all four URLs with an address reachable by your browser/devices. Update both port and URL fields when changing ports. Do not use container names or `localhost` as public addresses.

| Port field | Default | Public URL field / purpose |
| --- | --- | --- |
| `PANEL_APP_PORT_HTTP` | 3210 | `APP_URL`, no trailing slash |
| `PANEL_APP_PORT_S3` | 9000 | `S3_ENDPOINT`, browser-accessible S3 API |
| `PANEL_APP_PORT_ADMIN` | 9001 | RustFS console, restrict to trusted networks |
| `PANEL_APP_PORT_API` | 8787 | `AGENT_GATEWAY_URL`, HTTP/HTTPS with WebSocket proxying |
| `PANEL_APP_PORT_PROXY` | 8788 | `DEVICE_GATEWAY_PUBLIC_URL` for device discovery and connections |

Proxy all four endpoints for domain deployments. When the application uses HTTPS, use HTTPS for S3 and both gateways too. Enable WebSocket upgrades and long read timeouts on both gateway proxies. Devices connect using `lh connect --gateway <DEVICE_GATEWAY_PUBLIC_URL>`.

Internal application callbacks use `http://localhost:3210`, and server-side S3 traffic uses `http://rustfs:9000`. PostgreSQL, Redis and SearXNG have no published host ports. Only the application joins `1panel-network`; dependencies communicate over the instance-specific bridge network.

### Automatic credentials

The install/upgrade hook generates unique database/storage passwords, vault/authentication secrets, gateway token, matching RSA JWKS keys and a separate search secret. The internal database defaults to `lobehub`, and the RustFS username defaults to `admin`.

- Credentials persist in `./data/secrets/state.json`. Separate per-service env files are generated with directory mode `700` and file mode `600`. Secret values are not logged.
- Rebuilds use existing files. Re-running initialization/upgrading reuses saved credentials and repairs derived files without rotating keys.
- Uses host Node.js 16+ if available, otherwise the main image's Node.js in a temporary container. No extra host runtime installation is required; the main image may need downloading first.
- **Back up all of `./data/secrets/`.** Losing the vault key makes existing encrypted data unreadable. Existing data with missing/incomplete credentials or mismatched keys causes initialization to stop, not generate replacements.

When upgrading from the previous manual-secrets 2.x package, back up its `.env` first. The upgrade hook imports all seven existing secrets, database name and storage username. If 1Panel has already removed those old form fields, restore the old `.env` before running `bash scripts/upgrade.sh`. Never generate replacements. Once imported, `data/secrets/state.json` is authoritative.

### Sign in

Better Auth provides email/password registration and login. **There are no predefined application credentials and no bundled Casdoor.** Set `AUTH_ALLOWED_EMAILS` to a comma-separated allowlist before public exposure. Leaving it blank allows everyone to register/log in; it does not disable registration.

The RustFS console defaults to username `admin`; its generated password is `RUSTFS_SECRET_KEY` in `./data/secrets/state.json`. Imported 2.x installations keep their original credentials. View the file only through a trusted host file terminal and never paste it into public logs. Restrict the console's published port, accounting for Docker's actual firewall rules.

For SMTP, email verification, password resets, SSO or server-side model credentials, explicitly add upstream variables to `lobe.environment`. Email verification and password reset require an email service. The full `.env` is deliberately not passed to dependency containers; the gateway receives only the public JWKS, never its private counterpart.

## Components and persistence

- ParadeDB PostgreSQL 17 with `pgvector` / `pg_search`: `./data/postgresql`.
- Redis 7 with AOF: `./data/redis`.
- RustFS: `./data/rustfs`; the install hook prepares directory ownership for UID/GID `10001`.
- `rustfs-init`: creates the fixed `lobe` bucket, enables anonymous object reads, and configures browser CORS for `APP_URL`. Successful exit is expected, so this one-shot service uses `restart: no`. **Anyone holding an object URL can read that object. Do not treat the bucket as private storage.**
- SearXNG search settings: `./data/searxng-settings.yml`.
- Gateway `0.5.0`: Agent/device connections; in-flight state is lost on gateway restart.

Only the main application image is pinned in the versioned directory. Some dependency images follow upstream rolling tags; back up before pulling updates. PostgreSQL `pg_search` is used by default; optional Elasticsearch is not bundled.

From the installed Compose directory, back up the database:

```bash
docker compose exec -T postgresql sh -c 'pg_dump -U postgres "$POSTGRES_DB"' > lobehub.sql
```

Also back up configuration/`.env`, Compose and all of `./data/`, **especially `./data/secrets/` containing the internal credentials**. Stop services or use consistent snapshots for filesystem-level database backups. Restore matching database, files and secrets together. Never delete the database to fix migration errors.

After changing `APP_URL`, run `docker compose run --rm rustfs-init` to refresh bucket CORS. For manual Compose installations, configure public addresses/ports in `.env`, run `bash scripts/init.sh` to generate credentials and prepare directory ownership, then `docker compose up -d`. 1Panel runs initialization automatically.

## Migrating from 1.x

1. Stop writes and back up the old `.env`, Compose, PostgreSQL (including Casdoor), `./data` and `./s3_data`. Preserve the original `KEY_VAULTS_SECRET` for existing encrypted data. The legacy package's hardcoded key is public and must not be reused for a fresh installation.
2. Deploy 2.x in a separate test directory with different ports. Do not attach the old `./data` directly to the new database path or let two PostgreSQL servers share a data directory. Test logical backup restoration and schema migration with a database supporting `pg_search`.
3. Follow the official [2.0 breaking changes](https://lobehub.com/docs/self-hosting/migration/v2/breaking-changes) and [NextAuth migration](https://lobehub.com/docs/self-hosting/migration/v2/auth/nextauth-to-betterauth). Simply enabling new email registration does not preserve old SSO user associations. Configure the original provider and migrate account links as documented.
4. Keep the original Casdoor until migration is verified. Users need valid email addresses. Configure the new Better Auth provider/callback using the [Casdoor guide](https://lobehub.com/docs/self-hosting/auth/providers/casdoor); the old NextAuth callback must not be assumed valid.
5. Copy MinIO objects through the S3 API while preserving object keys. Do not mount a MinIO data directory into RustFS. Verify stored file/public URLs. To retain MinIO temporarily, explicitly adapt S3 variables and service dependencies in the new Compose file.
6. Verify users, chat history, knowledge bases, uploads/downloads and gateways before switching traffic. Rollback requires the matching old database backup and configuration, not just the old image.

This package does not automatically migrate databases, authentication or object storage.

## References

- [Upstream v2.3.4 Compose](https://github.com/lobehub/lobehub/blob/v2.3.4/docker-compose/deploy/docker-compose.yml)
- [Docker Compose deployment](https://lobehub.com/docs/self-hosting/platform/docker-compose)
- [Authentication variables](https://lobehub.com/docs/self-hosting/environment-variables/auth)
