---
name: 1panel-app-builder
description: Use when packaging Docker deployments as 1Panel local app store apps, including GitHub projects, docker-compose.yml files, docker run commands, app metadata, version directories, icons, README files, and 1Panel validation.
---

# 1Panel App Builder

Build or review 1Panel local app store packages from Docker deployments.

## When To Use

Use this skill when the user asks to:

- Add or package a 1Panel local app store app.
- Convert a GitHub project, `docker-compose.yml`, or `docker run` command into `apps/<app-key>/`.
- Fix 1Panel app metadata, port variables, compose files, README files, icons, or version directories.
- Validate an app package before commit.

For detailed real app examples, read `references/1panel-examples.md` only when needed.

## Required Shape

```text
apps/<app-key>/
├── data.yml
├── logo.png
├── README.md
├── README_en.md
└── <version>/
    ├── data.yml
    ├── docker-compose.yml
    └── data/
```

Some apps also include `latest/`. When both `latest/` and a concrete version exist, `latest/` must use image tag `latest`, and the concrete version directory should use the pinned tag.

## Workflow

1. Inspect the source deployment.
   - GitHub: inspect README/deploy docs and registry image; the generator checks common compose paths before README `docker run` fallback.
   - Compose: parse services, image tags, ports, volumes, environment, dependencies.
   - Docker run: parse image, `--name`, `-p/--publish`, `-v/--volume`, `-e/--env`, and `--env-file`.
2. Choose a stable app key.
   - Lowercase, hyphenated, directory-safe.
   - `additionalProperties.key` must match the directory name.
3. Generate or edit app files.
   - Prefer `latest/` plus a concrete version when a concrete image tag is known.
   - Preserve source volumes and environment unless they conflict with 1Panel conventions.
4. Resolve a real icon.
   - Do not create placeholders.
   - Use `--icon-mode skip` for drafts, `cache-only` for offline work, and `required` when an icon is mandatory.
5. Validate before delivery.
   - Run `skills/scripts/validate-app.sh ./apps/<app-key>`.
   - For Skill script changes, run `skills/tests/run_all.sh`.

## 1Panel Rules

- `container_name` should be `${CONTAINER_NAME}`.
- Services should use `restart: always`.
- Use external `1panel-network`.
- Port mappings should use `PANEL_APP_PORT_*` variables defined in the version `data.yml`.
- Persistent mounts should prefer relative `./data/...` paths.
- Add `labels: createdBy: "Apps"`.
- Keep metadata tags aligned with top-level `data.yaml`.

Preferred port variables:

```text
PANEL_APP_PORT_HTTP
PANEL_APP_PORT_HTTPS
PANEL_APP_PORT_API
PANEL_APP_PORT_ADMIN
PANEL_APP_PORT_PROXY
PANEL_APP_PORT_PROXY_HTTP
PANEL_APP_PORT_PROXY_HTTPS
PANEL_APP_PORT_DB
PANEL_APP_PORT_SSH
PANEL_APP_PORT_S3
PANEL_APP_PORT_SYNC
```

## Scripts

Run from `/root/github/1Panel-Appstore/skills` unless noted.

Generate a draft:

```bash
./scripts/generate-app.sh --app-key my-app --name MyApp --version 1.2.3 --icon-mode skip ./docker-compose.yml
```

Useful generation options:

```text
--output <dir>       Output base directory. Default: ./apps
--app-key <key>      Override app directory key.
--name <name>        Override display name.
--service <name>     Select the main service from a multi-service compose file.
--version <tag>      Override concrete version and image tag.
--icon-mode <mode>   auto|required|skip|cache-only
--icon-url <url>     Download icon from a known URL.
--force              Allow overwriting an existing generated directory.
--dry-run            Print parsed values without writing files.
--check-deps         Check required local tools.
```

Download an icon:

```bash
./scripts/download-icon.sh --mode cache-only redis ./logo.png
./scripts/download-icon.sh --mode required --url https://example.com/logo.png myapp ./logo.png
```

Validate an app:

```bash
./scripts/validate-app.sh ../apps/<app-key>
```

Validate Skill tooling:

```bash
./tests/run_all.sh
```

## Icon Policy

Icon lookup order:

1. Known explicit URL (`--icon-url`).
2. Local cache under `skills/.cache/icons`.
3. Dashboard Icons.
4. Simple Icons.
5. selfh.st Icons.

Missing icons are acceptable for drafts only. For final app delivery, leave `logo.png` absent and tell the user what is missing instead of inventing an inaccurate image.

## Validation Gate

Before considering an app ready:

- Run `./scripts/validate-app.sh ../apps/<app-key>`.
- Confirm `latest/` uses `:latest`.
- Confirm concrete version directories use matching image tags or document the exception.
- Confirm every compose `PANEL_APP_PORT_*` variable exists in the version `data.yml`.
- Inspect generated README and metadata manually; the generator is a starting point, not an authority.

## Common Mistakes

- Keeping a placeholder `logo.png`.
- Using a host absolute volume path when `./data/...` would work.
- Forgetting to define a port variable used by `docker-compose.yml`.
- Letting `additionalProperties.key` drift from the app directory name.
- Treating generated metadata, descriptions, tags, and architectures as final without review.
