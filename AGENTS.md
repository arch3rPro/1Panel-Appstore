# Repository Guidelines

## Project Shape

This repository is a third-party 1Panel local app store. It is mostly YAML,
Docker Compose files, READMEs, icons, and helper shell scripts. There is no
central application build step.

Top-level files:

- `data.yaml`: app store metadata and category/tag definitions.
- `apps/<app-key>/`: one app package per directory.
- `skills/`: app-generation guidance, templates, and helper scripts.
- `update/`: update-detection and README-version sync scripts.

## App Package Layout

Use this structure for each app:

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

Some apps also include `latest/`. When both `latest/` and a concrete version
exist, `latest/` should use an image tagged `latest`, and the concrete version
directory should use the pinned image tag.

## 1Panel Conventions

- App keys are lowercase and hyphenated, and must match the app directory name.
- Top-level `apps/<app-key>/data.yml` contains display metadata.
- Version-level `data.yml` contains `additionalProperties.formFields`.
- Prefer standard port variables such as `PANEL_APP_PORT_HTTP`,
  `PANEL_APP_PORT_HTTPS`, `PANEL_APP_PORT_API`, `PANEL_APP_PORT_ADMIN`,
  `PANEL_APP_PORT_PROXY`, `PANEL_APP_PORT_DB`, `PANEL_APP_PORT_SSH`,
  `PANEL_APP_PORT_S3`, and `PANEL_APP_PORT_SYNC`.
- Each `PANEL_APP_PORT_*` used in `docker-compose.yml` should have a matching
  form field in the version `data.yml`.
- Compose services should use `container_name: ${CONTAINER_NAME}`,
  `restart: always`, the external `1panel-network`, relative `./data/` volume
  paths for persistence, and `labels: createdBy: "Apps"`.
- Use `./data/...` mounts instead of host absolute paths unless the app
  genuinely requires host integration.
- Keep app metadata tags aligned with `data.yaml`.

## App Creation Workflow

Before adding or changing app packages, read `skills/SKILL.md`. It documents
the expected 1Panel packaging workflow, metadata fields, compose conversion
rules, README shape, and icon lookup order.

Useful helper scripts:

```bash
cd /root/github/1Panel-Appstore/skills
./scripts/generate-app.sh <github-url-or-compose-or-docker-run>
./scripts/download-icon.sh <app-name> <output-path> 200
./scripts/validate-app.sh ../apps/<app-key>
```

The generator is a starting point. Review and adjust generated metadata,
ports, volumes, environment variables, README content, and icons before
considering the app complete.

## Validation

For a changed app, run:

```bash
cd /root/github/1Panel-Appstore
./skills/scripts/validate-app.sh ./apps/<app-key>
```

For YAML or Compose edits, also inspect the affected files directly. The
validator is shell/grep based and catches common structural problems, not every
semantic issue.

## Update Scripts

The scripts in `update/` may perform network requests and `git pull`. Do not run
them casually while making focused app edits. If using them, inspect the script
and current worktree first.

## Editing Notes

- Preserve existing YAML indentation style within the file being edited.
- Keep READMEs concise and app-focused; many apps include both Chinese and
  English README files.
- Do not replace real logos with placeholders. If an icon cannot be found, call
  that out instead of inventing an inaccurate asset.
- Treat unrelated changes in the worktree as user-owned and leave them alone.
