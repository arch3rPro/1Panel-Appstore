# LXServer

LX Music Sync Server Enhanced Edition, a Node.js-based music sync server and web player.

## Features

- Modern web player with dark mode and multiple theme skins
- Multi-source aggregated search supporting major music platforms
- Cross-platform data synchronization for LX Music desktop and mobile
- Subsonic protocol support for third-party clients like Yinliu, Feishin
- Fully automated caching system for lyrics, links, and audio files
- Lyrics card sharing feature with customizable poster generation
- Access control with player password and admin/user permissions
- Support for importing custom music source scripts

## Usage

### Default Ports

- Web Player: 9527
- Admin Console: 9527

### Access URLs

- Web Player: http://your-ip:9527/music (configurable via `PLAYER_PATH`)
- Admin Console: http://your-ip:9527 (configurable via `ADMIN_PATH`)

### Default Credentials

- Admin Console Default Password: 123456 (change immediately after deployment)

### Data Directories

Application data is stored in the following directories:

- `./data`: Sync snapshots, user information, and system settings
- `./logs`: System runtime logs
- `./cache`: Web player automated cache files
- `./music`: Local music library directory

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| FRONTEND_PASSWORD | Web admin interface password | 123456 |
| ENABLE_WEBPLAYER_AUTH | Enable web player password | false |
| WEBPLAYER_PASSWORD | Web player access password | 123456 |
| PLAYER_PATH | Web player access path | /music |
| ADMIN_PATH | Admin console access path | (empty) |
| DISABLE_TELEMETRY | Disable anonymous telemetry | false |
| SUBSONIC_ENABLE | Enable Subsonic protocol support | true |
| SUBSONIC_PATH | Subsonic API access path | /rest |

## Links

- Website: https://xcq0607.github.io/lxserver/
- GitHub: https://github.com/XCQ0607/lxserver
- Documentation: https://xcq0607.github.io/lxserver/
- Docker Hub: https://hub.docker.com/r/xcq0607/lxserver
