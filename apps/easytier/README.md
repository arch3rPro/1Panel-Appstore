# EasyTier

一个简单、安全、去中心化的内网穿透 VPN 组网方案，使用 Rust 语言和 Tokio 框架实现。

![](https://cdn.jsdelivr.net/gh/xiaoY233/PicList@main/public/assets/Easytier.png)

![](https://img.shields.io/badge/Copyright-arch3rPro-ff9800?style=flat&logo=github&logoColor=white)

## 使用说明

> [!NOTE] 
>
> **注意：默认启动为服务器(Public_Server)模式，请根据个人需求配置./data/config.toml**

相关信息可通过容器日志与配置文件获取，注意参考官方文档来使用。

***
[简体中文](https://github.com/EasyTier/EasyTier/blob/main/README_CN.md) | [English](https://github.com/EasyTier/EasyTier/blob/main/README.md)

**请访问 [EasyTier 官网](https://www.easytier.top/) 以查看完整的文档。**


## 特点

- **去中心化**：无需依赖中心化服务，节点平等且独立。
- **安全**：支持利用 WireGuard 加密通信，也支持 AES-GCM 加密保护中转流量。
- **高性能**：全链路零拷贝，性能与主流组网软件相当。
- **跨平台**：支持 MacOS/Linux/Windows/Android，未来将支持 IOS。可执行文件静态链接，部署简单。
- **无公网 IP 组网**：支持利用共享的公网节点组网，可参考 [配置指南](https://github.com/EasyTier/EasyTier/blob/main/README_CN.md#%E6%97%A0%E5%85%AC%E7%BD%91IP%E7%BB%84%E7%BD%91)
- **NAT 穿透**：支持基于 UDP 的 NAT 穿透，即使在复杂的网络环境下也能建立稳定的连接。
- **子网代理（点对网）**：节点可以将可访问的网段作为代理暴露给 VPN 子网，允许其他节点通过该节点访问这些子网。
- **智能路由**：根据流量智能选择链路，减少延迟，提高吞吐量。
- **TCP 支持**：在 UDP 受限的情况下，通过并发 TCP 链接提供可靠的数据传输，优化性能。
- **高可用性**：支持多路径和在检测到高丢包率或网络错误时切换到健康路径。
- **IPV6 支持**：支持利用 IPV6 组网。
- **多协议类型**: 支持使用 WebSocket、QUIC 等协议进行节点间通信。
