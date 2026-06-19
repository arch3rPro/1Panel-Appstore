# Tailscale

The easiest, most secure way to use WireGuard. Tailscale enables you to create secure mesh networks that connect your devices together, no matter where they are located.

## Features

- **WireGuard-based**: Uses modern WireGuard protocol for high performance and strong security
- **Automatic NAT Traversal**: Automatically handles complex network environments for direct device connections
- **Zero Configuration**: No manual setup required, just login and use
- **End-to-End Encryption**: All communications are encrypted end-to-end
- **Multi-Platform Support**: Supports Linux, Windows, macOS, iOS, Android and more
- **Subnet Routing**: Route entire subnets to your Tailscale network
- **Magic DNS**: Automatically assigns friendly DNS names to devices
- **Access Control**: Fine-grained access control policies

## Usage Instructions

### Authentication Methods

Tailscale supports two authentication methods:

#### Method 1: Using Auth Key (Recommended)

1. Visit [Tailscale Admin Console](https://login.tailscale.com/admin/settings/keys)
2. Click "Generate auth key" to create an authentication key
3. Copy the generated key and fill it in the "Tailscale Auth Key" field during deployment
4. Authentication completes automatically after deployment

**Note**: Auth keys have an expiration time, please use them as soon as possible after generation.

#### Method 2: Interactive Login

1. Leave the "Tailscale Auth Key" field empty during deployment
2. After deployment, click the "Terminal" button for the "Tailscale" container in 1Panel
3. Execute the following command in the terminal:
   ```bash
   tailscale up
   ```
4. The command will output an authentication URL, copy it to your browser
5. Log in to your Tailscale account and authorize the device
6. After successful authentication, the container will automatically connect to the Tailscale network

### Deployment Parameters

- **Tailscale Auth Key** (Optional): Authentication key from admin console, leave empty for interactive login
- **Userspace Mode**: 
  - `false` (Recommended): Use kernel networking mode for better performance
  - `true`: Use userspace networking mode for better compatibility
- **Subnet Routes** (Optional): Subnets to advertise, e.g., `192.168.1.0/24,10.0.0.0/8`
- **Accept DNS**: Whether to accept Tailscale DNS configuration
- **Extra Args** (Optional): Additional arguments for tailscale up command, e.g., `--accept-routes`

### Post-Deployment Steps

1. After deployment, visit [Tailscale Admin Console](https://login.tailscale.com/admin/machines) to check device status
2. Install Tailscale clients on other devices and login with the same account
3. Devices can access each other via Tailscale IP or MagicDNS names

### Advanced Configuration

#### Configure Subnet Router

If you want to route your local network to Tailscale:

1. Fill in the subnets to advertise in `Subnet Routes` parameter, e.g., `192.168.1.0/24`
2. Approve the subnet route in admin console after deployment
3. Other Tailscale devices can then access devices in that subnet

#### Configure Exit Node

Configure Tailscale as an exit node to allow other devices to access the internet through it:

1. Add `--advertise-exit-node` to `Extra Args` parameter
2. Approve the exit node in admin console after deployment
3. Other devices can choose to use this exit node

#### First-Time Authentication Only

If you want to use the auth key only on first startup and use existing state on subsequent starts:

- Set environment variable `TS_AUTH_ONCE=true` (needs to be manually added in docker-compose.yml)

### Data Directory

Application data is stored in `./data/state` directory, containing Tailscale state information (authentication state, configuration, etc.). This directory is mounted to `/var/lib/tailscale` in the container.

**Important**: Ensure the `data/state` directory has correct read/write permissions, otherwise state cannot be persisted and re-authentication will be required on every restart.

## Environment Variables

- `TS_AUTHKEY`: Tailscale authentication key (optional, supports interactive login)
- `TS_USERSPACE`: Whether to use userspace networking mode
- `TS_STATE_DIR`: State file storage directory (fixed to /var/lib)
- `TS_ROUTES`: Subnet routes to advertise
- `TS_ACCEPT_DNS`: Whether to accept Tailscale DNS configuration
- `TS_EXTRA_ARGS`: Additional arguments for tailscale up command
- `TS_AUTH_ONCE`: Whether to authenticate only on first start (default false)

## Notes

- Requires `privileged` mode and `NET_ADMIN`, `SYS_MODULE` capabilities
- Uses `host` network mode to directly manage network interfaces
- Requires access to `/dev/net/tun` device
- A valid auth key or interactive login is required for first run
- Recommended to allow UDP port 41641 (WireGuard default port) in firewall
- Container restart policy is fixed to `always`, managed by 1Panel

## Links

- Website: https://tailscale.com
- GitHub: https://github.com/tailscale/tailscale
- Documentation: https://tailscale.com/kb
- Admin Console: https://login.tailscale.com/admin
- Downloads: https://tailscale.com/download
