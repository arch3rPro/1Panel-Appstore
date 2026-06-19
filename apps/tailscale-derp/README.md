# Tailscale Derp

Tailscale DERP 中继服务器，使用完整配置方式，包含tailscale和derper共存的部署方案。

## 功能特点

- 完整的tailscale和derper共存配置
- 支持客户端验证，防止被滥用
- 占用资源少，部署简单
- 支持多种架构（amd64、arm64、arm/v7）

## 使用说明

### 默认端口

- TCP: 43443
- UDP: 43478

### 登录指南

部署完成后，tailscale容器需要登录认证才能正常工作：

1. **查看tailscale容器日志获取登录链接**：
```bash
# 查看tailscale容器日志
docker logs -f <容器名称>-tailscale
```

2. **在日志中找到登录链接**：
```
Switching ipn state NoState -> NeedsLogin (WantRunning=false, nm=false)
To authenticate, visit:
        https://login.tailscale.com/a/xxxxxxx
```

3. **复制链接到浏览器打开并登录Tailscale账户**

4. **验证登录状态**：
登录成功后，再次查看日志应该显示类似以下内容：
```
Switching ipn state NeedsLogin -> Running (WantRunning=true, nm=false)
```

### 防火墙配置

确保服务器防火墙开放以下端口：
- TCP 43443
- UDP 43478

### Tailscale ACL 配置

在 Tailscale 控制面板的 Access controls 中添加以下配置：

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

保存后，客户端需要重新连接以获取新配置。

### 验证部署

使用以下命令验证 DERP 服务器是否正常工作：

```bash
tailscale netcheck
```

## 相关链接

- 官方网站: https://tailscale.com
- GitHub: https://github.com/yangchuansheng/ip_derper
- 部署文档: https://seepine.com/ops/tailscale/derper/