# Tailscale Derp

Tailscale DERP relay server with complete configuration, including coexistence of tailscale and derper.

## Features

- Complete tailscale and derper coexistence configuration
- Supports client verification to prevent abuse
- Low resource consumption, simple deployment
- Supports multiple architectures (amd64, arm64, arm/v7)

## Usage

### Default Ports

- TCP: 43443
- UDP: 43478

### Login Guide

After deployment, the tailscale container needs login authentication to work properly:

1. **Check tailscale container logs for login link**:
```bash
# Check tailscale container logs
docker logs -f <container-name>-tailscale
```

2. **Find the login link in the logs**:
```
Switching ipn state NoState -> NeedsLogin (WantRunning=false, nm=false)
To authenticate, visit:
        https://login.tailscale.com/a/xxxxxxx
```

3. **Copy the link to browser and login to your Tailscale account**

4. **Verify login status**:
After successful login, check the logs again should show:
```
Switching ipn state NeedsLogin -> Running (WantRunning=true, nm=false)
```

### Firewall Configuration

Ensure the following ports are open in the server firewall:
- TCP 43443
- UDP 43478

### Tailscale ACL Configuration

Add the following configuration in the Access controls section of the Tailscale control panel:

```json
{
  "derpMap": {
    "OmitDefaultRegions": false,
    "Regions": {
      "912": {
        "RegionID": 912,
        "RegionCode": "derper_self",
        "RegionName": "Derper Self",
        "Nodes": [
          {
            "Name": "derper_self",
            "RegionID": 912,
            "DERPPort": 43443,
            "STUNPort": 43478,
            "IPv4": "YOUR_SERVER_IP",
            "InsecureForTests": true
          }
        ]
      }
    }
  }
}
```

After saving, clients need to reconnect to get the new configuration.

### Verify Deployment

Use the following command to verify the DERP server is working:

```bash
tailscale netcheck
```

## Links

- Website: https://tailscale.com
- GitHub: https://github.com/yangchuansheng/ip_derper
- Documentation: https://seepine.com/ops/tailscale/derper/