# WeRSS - WeChat Official Account RSS Subscription Assistant

WeRSS is a tool for subscribing to and managing WeChat Official Account content, providing RSS subscription functionality.

## Key Features

- WeChat Official Account content crawling and parsing
- RSS feed generation
- User-friendly web management interface
- Scheduled automatic content updates
- Multiple database support (SQLite by default, MySQL optional)
- Multi-theme switching (13 themes)
- Cascade system: parent-child node architecture with smart task dispatching
- Custom notification channels (DingTalk, WeCom, Feishu, custom Webhook)
- Export to md/docx/pdf/json formats
- API and WebHook integration

## Deployment Notes

- Uses SQLite by default; data is persisted in the `./data` directory.
- Default admin account: `admin`, password: `admin@123` — change it after installation.
- After installation, visit `http://<server-ip>:<port>` to get started.

## Configuration

| Parameter | Description | Default |
| --- | --- | --- |
| `PANEL_APP_PORT_HTTP` | Web access port | `8001` |
| `PANEL_APP_USERNAME` | Admin username | `admin` |
| `PANEL_APP_PASSWORD` | Admin password | `admin@123` |

## Documentation

For more information, see the [official repository](https://github.com/rachelos/we-mp-rss).
