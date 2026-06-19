# CLIProxyAPI Plus

CLIProxyAPI Plus is an enhanced version of CLIProxyAPI, adding support for third-party providers on top of the mainline project. All third-party provider support is maintained by community contributors.

## Features

- Support for multiple AI model providers (Claude, Gemini, Codex, Qwen, etc.)
- Third-party provider extensions
- OAuth authentication support
- High-performance proxy design
- Web management interface
- Flexible routing and load balancing strategies

## Usage

### Default Ports

- **Web UI Port (8317)**: Primary Web management interface and API port
  - Web Management UI: `http://localhost:8317/management.html`
  - API Endpoint: `http://localhost:8317/v1`
- **Proxy Port (8085)**: Proxy service port
- **Additional Ports**: 1455, 54545, 51121, 11451 (for specific feature extensions)

### Web Management Interface

To access the Web management interface after deployment:

1. **Edit config file** `./data/config.yaml`
   - Set `remote-management.allow-remote` to `true` to allow remote access
   - Set `remote-management.secret-key` to your management secret

2. **Access URL** (replace with your server IP):

```
http://your-server-ip:8317/management.html
```

**Note**: Default `allow-remote` is `false`, only local access is allowed. To access from other machines, please set to `true` and configure a strong password.

### Configuration Files

Application data is stored in the `./data` directory:

- `config.yaml` - Main configuration file
  - API key configuration
  - Provider settings
  - Routing strategy
  - Proxy settings
- `auths/` - OAuth authentication storage directory
- `logs/` - Application logs directory

### Quick Configuration

1. Edit the `./data/config.yaml` file
2. Add your API keys in the `api-keys` section
3. For remote access, set `remote-management.allow-remote: true` and `remote-management.secret-key`
4. Configure providers as needed (Claude, Gemini, Codex, etc.)
5. Restart the application for changes to take effect

### Key Configuration Items

```yaml
# API Keys
api-keys:
  - 'your-api-key-1'
  - 'your-api-key-2'

# Management interface settings
remote-management:
  allow-remote: false        # Allow remote management, true=allow, false=local only
  secret-key: ''             # Management key (will be hashed after first startup)
  disable-control-panel: false

# Proxy settings
proxy-url: ""                # Global proxy URL

# Routing strategy
routing:
  strategy: 'round-robin'    # round-robin or fill-first
```

## Version Information

- **latest**: Latest development version
- **6.9.9-0**: Latest stable version (recommended)

## Links

- Official Documentation: https://help.router-for.me/cn/introduction/quick-start.html
- Web UI Documentation: https://help.router-for.me/cn/management/webui.html
- GitHub: https://github.com/router-for-me/CLIProxyAPIPlus
- Issue Tracker: https://github.com/router-for-me/CLIProxyAPIPlus/issues

## Important Notes

1. Please modify `api-keys` and management key promptly after first deployment
2. For remote access, set `allow-remote: true` and configure a strong password
3. In production, it's recommended to set `allow-remote` back to `false` after use for better security
4. For OAuth authentication, ensure the `auths/` directory has proper read/write permissions
5. TLS encryption is recommended for production environments

## Support

- Mainline project issues: Please submit issues to the mainline repository
- Plus version third-party provider issues: Please contact the corresponding community maintainer
