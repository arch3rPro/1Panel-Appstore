# Fast Note Sync Service

Fast Note Sync Service is a high-performance, low-latency note synchronization, online management, and REST API service platform for Obsidian, built with Go, WebSocket, and React.

## Features

- Sync Obsidian notes, folders, configuration, and attachments
- Web administration panel for users, vaults, and note browsing
- REST API, MCP, sharing, history, trash, and multi-storage backup support
- Configurable SQLite, MySQL, and PostgreSQL database support

## Usage

### Default Port

- Web admin panel / API / WebSocket: 9000

### Initial Account

- Open `http://SERVER_IP:9000` and register the first account
- To disable public registration, set `user.register-is-enable: false` in the configuration file

### Data Directories

- Notes and attachments: `./data/storage`
- Configuration files: `./data/config`

### Client Setup

Log in to the web admin panel, click "Copy API Configuration", and paste it into the Obsidian Fast Note Sync plugin settings.

## Links

- GitHub: https://github.com/haierkeys/fast-note-sync-service
- Obsidian plugin: https://github.com/haierkeys/obsidian-fast-note-sync
- REST API docs: https://github.com/haierkeys/fast-note-sync-service/blob/master/docs/REST_API.md
