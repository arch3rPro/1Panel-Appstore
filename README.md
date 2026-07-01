<p align="center">
  <img src="https://raw.githubusercontent.com/arch3rPro/1Panel-Appstore/main/1Panel-Appstore.png" >
</p>
<h1 align="center">1Panel AppStore </h1>
<br>
<p align="center">
  <img src="https://img.shields.io/badge/Author-Arch3rPro-blueviolet.svg">
  <img src="https://img.shields.io/badge/Release-v1.0-blue.svg" />
  <img src="https://img.shields.io/badge/Platform-Docker-red.svg" />
  <img src="https://img.shields.io/badge/Awesome-List-9cf.svg">
</p>

<p align="center">
  <a href="http://www.secnews.xyz/">作者博客</a> | 
  <a href="http://www.secnews.xyz/document">文档教程</a> | 
  <a href="http://nav.secnews.xyz/">安全导航</a> | 
  <a href="http://nav.secnews.xyz/wechat.html">微信公众号导航</a> 
</p>

### 📖 仓库介绍

- 本仓库包含多个适用于 1Panel 的应用，旨在为用户提供简单、快速的安装与更新体验。应用均为开源项目，支持通过 1Panel 的计划任务功能自动化安装和更新。通过仓库提供的脚本，可以轻松地将应用集成到 1Panel 系统中。
- 仓库主打优质应用合集，不追求大而全(很多基本用不上的应用会干扰检索查看)，有推荐的应用可以在issue中进行提交

### ⚠️ 仓库申明

- 非官方，第三方应用商店
- 不对任何原始镜像的有效性做出任何明示或暗示的保证或声明，安全性和风险自查
- 个人仓库，可以Fork后自行更新，但是严禁未经授权，私自删除个人信息后合并发布

### 🚀 使用方法

#### 📋 添加脚本到 1Panel 计划任务

1. 在 1Panel 控制面板中，进入"计划任务"页面。
2. 点击"新增任务"，选择任务类型为"Shell 脚本"。
3. 在脚本框中粘贴以下代码：

```bash
#!/bin/bash

# 清理旧的临时目录
rm -rf /tmp/appstore_merge

# 克隆 appstore-arch3rPro
git clone --depth=1 https://ghfast.top/https://github.com/arch3rPro/1Panel-Appstore /tmp/appstore_merge/appstore-arch3rPro

# 复制 数据（完整复制）
cp -rf /tmp/appstore_merge/appstore-arch3rPro/apps/* /opt/1panel/resource/apps/local/

# 清理临时目录
rm -rf /tmp/appstore_merge
echo "应用商店数据已更新"
```

### 🤖 使用 AI 快速生成应用配置

本仓库提供了 Skill 配置，支持在 Cursor、Windsurf、Claude Code 等 AI 客户端中快速生成 1Panel 应用配置。

#### 📁 Skills 目录结构

```
skills/
├── SKILL.md              # 1Panel App Builder 技能定义
├── README.md             # 使用文档
├── templates/            # 配置模板
│   ├── data.yml.tpl      # 应用元数据模板
│   └── docker-compose.yml.tpl # 编排文件模板
├── scripts/              # 工具脚本
│   ├── generate-app.sh   # 主生成脚本
│   ├── download-icon.sh  # 图标下载工具
│   └── validate-app.sh   # 配置验证工具
├── references/           # 参考示例
│   └── 1panel-examples.md
└── examples/             # 使用示例
    └── example-usage.md
```

#### 💡 使用示例

只需向 AI 提供以下任一信息，即可自动生成完整的应用配置：

```
# GitHub 项目
添加应用 AList https://github.com/alist-org/alist

# docker-compose 文件
根据这个 docker-compose.yml 生成 1Panel 应用配置

# docker run 命令
将这个 docker run 命令转换为 1Panel 应用：
docker run -d --name=nginx -p 80:80 nginx:latest
```

#### ✨ AI 生成的配置包含

- `data.yml` - 应用元数据（顶层）
- `version/data.yml` - 参数定义（表单字段）
- `docker-compose.yml` - Docker 编排文件
- `README.md` - 中文文档
- `README_en.md` - 英文文档
- `logo.png` - 应用图标

### 📱 应用列表

以下是当前在本仓库中提供的应用列表及其版本信息，**点击应用名称可查看应用详细介绍文档**

#### 🤖LLM免费API接口

- 支持一键部署AI免费API接口，使用方式请参考应用内**README介绍**
- **Free-API系列应用已下架，原项目由于供应链投毒，被植入恶意代码，请及时停止运行并删除这些服务！！！**
- 经过几天的排查和重构，已重新上架[GLM-Free-API](https://github.com/xiaoY233/GLM-Free-API)、[MiniMax-Free-API](https://github.com/xiaoY233/MiniMax-Free-API)、[Qwen-Free-API](https://github.com/xiaoY233/Qwen-Free-API)、[Kimi-Free-API](https://github.com/xiaoY233/Kimi-Free-API)，[DeepSeek-Free-API](https://github.com/xiaoY233/DeepSeek-Free-API),欢迎各位对源码进行审查，如果不放心，建议还是暂停使用！

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/deepseek-free-api/README.md">
<img src="./apps/deepseek-free-api/logo.png" width="60" height="60" alt="DeepSeek-Free-API">
<br><b>DeepSeek-Free-API</b>
</a>

🚀 DeepSeek-V3 & R1大模型逆向API

<kbd>1.0.2</kbd> • [官网链接](https://github.com/xiaoY233/DeepSeek-Free-API)

</td>
<td width="33%" align="center">

<a href="./apps/kimi-free-api/README.md">
<img src="./apps/kimi-free-api/logo.png" width="60" height="60" alt="Kimi-Free-API">
<br><b>Kimi-Free-API</b>
</a>

🚀 KIMI AI 长文本大模型逆向API, 支持Kimi-K2模型

<kbd>1.0.2</kbd> • [官网链接](https://github.com/xiaoY233/Kimi-Free-API)

</td>
<td width="33%" align="center">

<a href="./apps/qwen-free-api/README.md">
<img src="./apps/qwen-free-api/logo.png" width="60" height="60" alt="Qwen-Free-API">
<br><b>Qwen-Free-API</b>
</a>

🚀 阿里通义千问3.0大模型逆向API,支持Qwen3-Coder模型

<kbd>1.0.1</kbd> • [官网链接](https://github.com/xiaoY233/Qwen-Free-API)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/glm-free-api/README.md">
<img src="./apps/glm-free-api/logo.png" width="60" height="60" alt="GLM-Free-API">
<br><b>GLM-Free-API</b>
</a>

🚀 智谱清言ChatGLM-4-Plus大模型逆向API

<kbd>1.0.2</kbd> • [官网链接](https://github.com/xiaoY233/GLM-Free-API)

</td>
<td width="33%" align="center">

<!-- <a href="./apps/jimeng-free-api/README.md">
<img src="./apps/jimeng-free-api/logo.png" width="60" height="60" alt="Jimeng-Free-API"> -->

<b>Jimeng-Free-API</b> </a>

🚀 即梦3.0逆向API【特长：图像生成顶流】

<kbd>已下架</kbd> • [官网链接](https://github.com/LLM-Red-Team/jimeng-free-api)

</td>
<td width="33%" align="center">

<!-- <a href="./apps/spark-free-api/README.md">
<img src="./apps/spark-free-api/logo.png" width="60" height="60" alt="Spark-Free-API"> -->

<b>Spark-Free-API</b> </a>

🚀 讯飞星火大模型逆向API【特长：办公助手】

<kbd>已下架</kbd> • [官网链接](https://github.com/LLM-Red-Team/spark-free-api)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/minimax-free-api/README.md">
<img src="./apps/minimax-free-api/logo.png" width="60" height="60" alt="Minimax-Free-API">
<br><b>Minimax-Free-API</b>
</a>

🚀 MiniMax大模型海螺AI逆向API【特长：超自然语音】

<kbd>1.0.1</kbd> • [官网链接](https://github.com/xiaoY233/MiniMax-Free-API)

</td>
<td width="33%" align="center">

<!-- <a href="./apps/step-free-api/README.md">
<img src="./apps/step-free-api/logo.png" width="60" height="60" alt="Step-Free-API"> -->

<b>Step-Free-API</b> </a>

🚀 阶跃星辰跃问Step 多模态大模型逆向API【特长：超强多模态】

<kbd>已下架</kbd> • [官网链接](https://github.com/LLM-Red-Team/step-free-api)

</td>
<td width="33%" align="center">

<!-- <a href="./apps/metaso-free-api/README.md">
<img src="./apps/metaso-free-api/logo.png" width="60" height="60" alt="Metaso-Free-API"> -->

<b>Metaso-Free-API</b> </a>

🚀 秘塔AI搜索逆向API【特长：超强检索超长输出】

<kbd>已下架</kbd> • [官网链接](https://github.com/LLM-Red-Team/metaso-free-api)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/gpt4free/README.md">
<img src="./apps/gpt4free/logo.png" width="60" height="60" alt="GPT4Free">
<br><b>GPT4Free</b>
</a>

🚀 免费的GPT-4和其他大语言模型API接口

<kbd>7.7.0-slim</kbd> • [官网链接](https://github.com/xtekky/gpt4free)

</td>
<td width="33%" align="center">

<a href="./apps/raycast-ai-openrouter-proxy/README.md">
<img src="./apps/raycast-ai-openrouter-proxy/logo.png" width="60" height="60" alt="Raycast AI OpenRouter Proxy">
<br><b>Raycast AI OpenRouter Proxy</b>
</a>

🚀 Raycast AI的OpenAI兼容API代理，无需Pro订阅

<kbd>0.0.2</kbd> • [官网链接](https://github.com/miikkaylisiurunen/raycast-ai-openrouter-proxy)

</td>
<td width="33%" align="center">

<a href="./apps/chatgpt-adapter/README.md">
<img src="./apps/chatgpt-adapter/logo.png" width="60" height="60" alt="ChatGPT Adapter">
<br><b>ChatGPT Adapter</b>
</a>

🚀 多款AI聊天逆向接口适配到OpenAI标准接口

<kbd>latest</kbd> • [官网链接](https://github.com/bincooo/chatgpt-adapter)

</td>
</tr>
</table>

#### 📝 文档与内容管理

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/docmost/README.md">
<img src="./apps/docmost/logo.png" width="60" height="60" alt="DocMost">
<br><b>DocMost</b>
</a>

轻量级文档管理系统，支持多人协作编辑与版本控制

<kbd>0.90.1</kbd> • [官网链接](https://github.com/docmost/docmost)

</td>
<td width="33%" align="center">

<a href="./apps/hexo/README.md">
<img src="./apps/hexo/logo.png" width="60" height="60" alt="Hexo">
<br><b>Hexo</b>
</a>

快速静态博客框架，支持Markdown编写，丰富的插件和主题

<kbd>stable-26-06-04</kbd> • [官网链接](https://github.com/hexojs/hexo)

</td>
<td width="33%" align="center">

<a href="./apps/qexo/README.md">
<img src="./apps/qexo/logo.png" width="60" height="60" alt="QEXO">
<br><b>QEXO</b>
</a>

美观强大的在线静态博客管理器，支持多种平台

<kbd>4.2.0</kbd> • [官网链接](https://github.com/Qexo/Qexo)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/md/README.md">
<img src="./apps/md/logo.png" width="60" height="60" alt="MD">
<br><b>MD</b>
</a>

微信 Markdown 编辑器，自动即时渲染为微信图文

<kbd>2.1.0</kbd> • [官网链接](https://github.com/doocs/md)

</td>
<td width="33%" align="center">

<a href="./apps/karakeep/README.md">
<img src="./apps/karakeep/logo.png" width="60" height="60" alt="Karakeep">
<br><b>Karakeep</b>
</a>

自托管全能书签管理工具，支持AI自动标签功能

<kbd>0.32.0</kbd> • [官网链接](https://github.com/karakeep-app/karakeep)

</td>
<td width="33%" align="center">

<a href="./apps/linkwarden/README.md">
<img src="./apps/linkwarden/logo.png" width="60" height="60" alt="Linkwarden">
<br><b>Linkwarden</b>
</a>

自托管协作书签管理工具，支持网页归档和团队协作

<kbd>2.14.1</kbd> • [官网链接](https://github.com/linkwarden/linkwarden)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/affine/README.md">
<img src="./apps/affine/logo.png" width="60" height="60" alt="AFFiNE">
<br><b>AFFiNE</b>
</a>

文档、白板和数据库完全整合的工作空间

<kbd>0.26.3</kbd> • [官网链接](https://github.com/toeverything/AFFiNE)

</td>
<td width="33%" align="center">

<a href="./apps/blinko/README.md">
<img src="./apps/blinko/logo.png" width="60" height="60" alt="Blinko">
<br><b>Blinko</b>
</a>

开源自托管个人笔记工具，支持AI增强笔记检索

<kbd>1.8.8</kbd> • [官网链接](https://github.com/blinko-space/blinko)

</td>
<td width="33%" align="center">

<a href="./apps/opendeepwiki/README.md">
<img src="./apps/opendeepwiki/logo.png" width="60" height="60" alt="OpenDeepWiki">
<br><b>OpenDeepWiki</b>
</a>

AI驱动的开源代码知识库与文档协作平台，支持多模型、多数据库、智能文档生成

<kbd>latest</kbd> • [官网链接](https://opendeep.wiki/)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/wewe-rss/README.md">
<img src="./apps/wewe-rss/logo.png" width="60" height="60" alt="WeWe RSS">
<br><b>WeWe RSS</b>
</a>

更优雅的微信公众号订阅方式，支持RSS输出和全文内容

<kbd>2.6.1</kbd> • [官网链接](https://github.com/cooderl/wewe-rss)

</td>
<td width="33%" align="center">

<a href="./apps/nocodb/README.md">
<img src="./apps/nocodb/logo.png" width="60" height="60" alt="NocoDB">
<br><b>NocoDB</b>
</a>

开源Airtable替代品，将任何数据库转换为智能电子表格

<kbd>2026.06.2</kbd> • [官网链接](https://github.com/nocodb/nocodb)

</td>
<td width="33%" align="center">

<a href="./apps/rustfs/README.md">
<img src="./apps/rustfs/logo.png" width="60" height="60" alt="RustFS">
<br><b>RustFS</b>
</a>

高性能Rust对象存储系统，提供S3兼容API

<kbd>1.0.0-alpha.70</kbd> • [官网链接](https://github.com/rustfs/rustfs)

</td>
</tr>
</table>

#### 🔒 安全与网络工具

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/easytier/README.md">
<img src="./apps/easytier/logo.png" width="60" height="60" alt="EasyTier">
<br><b>EasyTier</b>
</a>

🌐 简单安全去中心化的内网穿透 VPN 组网方案

<kbd>2.6.4</kbd> • [官网链接](https://github.com/EasyTier/Easytier)

</td>
<td width="33%" align="center">

<a href="./apps/npc/README.md">
<img src="./apps/npc/logo.png" width="60" height="60" alt="NPC">
<br><b>NPC</b>
</a>

🔗 NPS客户端，轻量级高性能内网穿透代理工具

<kbd>0.34.7</kbd> • [官网链接](https://github.com/djylb/nps)

</td>
<td width="33%" align="center">

<a href="./apps/nps/README.md">
<img src="./apps/nps/logo.png" width="60" height="60" alt="NPS">
<br><b>NPS</b>
</a>

🔄 轻量级高性能内网穿透代理服务器

<kbd>0.33.11</kbd> • [官网链接](https://github.com/djylb/nps)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/safeline/README.md">
<img src="./apps/safeline/logo.png" width="60" height="60" alt="SafeLine">
<br><b>SafeLine</b>
</a>

🛡️ 简单好用的Web应用防火墙(WAF)

<kbd>9.3.7</kbd> • [官网链接](https://github.com/chaitin/SafeLine)

</td>

<td width="33%" align="center">

<a href="./apps/kali-linux/README.md">
<img src="./apps/kali-linux/logo.png" width="60" height="60" alt="Kali Linux">
<br><b>Kali Linux</b>
</a>

🔍 专为渗透测试和安全审计设计的Linux发行版

<kbd>latest</kbd> • [官网链接](https://www.kali.org/)

</td>

<td width="33%" align="center">

<a href="./apps/portnote/README.md">
<img src="./apps/portnote/logo.png" width="60" height="60" alt="PortNote">
<br><b>PortNote</b>
</a>

🔌 轻量级服务器端口管理与可视化工具，支持多平台部署

<kbd>1.2.0</kbd> • [官网链接](https://github.com/crocofied/PortNote)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/tailscale/README.md">
<img src="./apps/tailscale/logo.png" width="60" height="60" alt="Tailscale">
<br><b>Tailscale</b>
</a>

🔐 私有 WireGuard 网络组网工具

<kbd>1.98.4</kbd> • [官网链接](https://tailscale.com)

</td>
<td width="33%" align="center">

<a href="./apps/tailscale-derp/README.md">
<img src="./apps/tailscale-derp/logo.png" width="60" height="60" alt="Tailscale DERP">
<br><b>Tailscale DERP</b>
</a>

🛰️ Tailscale DERP 中继服务器，无需域名即可使用

<kbd>latest</kbd> • [官网链接](https://tailscale.com)

</td>
</tr>
</table>

#### 🤖 AI 与智能应用

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/lobe-chat-data/README.md">
<img src="./apps/lobe-chat-data/logo.png" width="60" height="60" alt="LobeChat-Data">
<br><b>LobeChat-Data</b>
</a>

💬 开源现代设计的 ChatGPT/LLMs UI/框架

<kbd>1.143.3</kbd> • [官网链接](https://github.com/lobehub/lobe-chat)

</td>
<td width="33%" align="center">

<a href="./apps/dify/README.md">
<img src="./apps/dify/logo.png" width="60" height="60" alt="Dify">
<br><b>Dify</b>
</a>

🤖 开源LLM应用开发平台，支持AI工作流和RAG管道

<kbd>1.14.2</kbd> • [官网链接](https://github.com/langgenius/dify)

</td>
<td width="33%" align="center">

<a href="./apps/prompt-optimizer/README.md">
<img src="./apps/prompt-optimizer/logo.png" width="60" height="60" alt="Prompt-Optimizer">
<br><b>Prompt-Optimizer</b>
</a>

🚀 强大的AI提示词优化工具，支持多种主流大语言模型

<kbd>2.11.7</kbd> • [官网链接](https://github.com/arch3rPro/Prompt-Optimizer)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/new-api/README.md">
<img src="./apps/new-api/logo.png" width="60" height="60" alt="New-API">
<br><b>New-API</b>
</a>

🍥 新一代大模型网关与AI资产管理系统，支持多种模型统一调用

<kbd>0.13.2</kbd> • [官网链接](https://docs.newapi.pro/)

</td>
<td width="33%" align="center">

<a href="./apps/one-hub/README.md">
<img src="./apps/one-hub/logo.png" width="60" height="60" alt="One-Hub">
<br><b>One-Hub</b>
</a>

🔗 统一的AI模型管理和调用平台，支持多种大语言模型集成

<kbd>0.14.27</kbd> • [官网链接](https://github.com/one-hub/one-hub)

</td>
<td width="33%" align="center">

<a href="./apps/gpt-load/README.md">
<img src="./apps/gpt-load/logo.png" width="60" height="60" alt="GPT-Load">
<br><b>GPT-Load</b>
</a>

🚀 智能密钥轮询的多渠道AI代理，高性能企业级AI接口透明代理服务

<kbd>1.4.8</kbd> • [官网链接](https://github.com/tbphp/gpt-load)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/flowise/README.md">
<img src="./apps/flowise/logo.png" width="60" height="60" alt="Flowise">
<br><b>Flowise</b>
</a>

🔮 开源可视化AI工作流构建平台，拖拽式设计LLM应用

<kbd>3.1.3</kbd> • [官网链接](https://github.com/FlowiseAI/Flowise)

</td>
<td width="33%" align="center">

<a href="./apps/inspector/README.md">
<img src="./apps/inspector/logo.png" width="60" height="60" alt="MCP Inspector">
<br><b>MCP Inspector</b>
</a>

🔍 模型上下文协议调试工具，支持MCP服务器测试与开发

<kbd>0.22.0</kbd> • [官网链接](https://github.com/modelcontextprotocol/inspector)

</td>
<td width="33%" align="center">

<a href="./apps/metamcp/README.md">
<img src="./apps/metamcp/logo.png" width="60" height="60" alt="MetaMCP">
<br><b>MetaMCP</b>
</a>

🚀 MCP聚合器、编排器、中间件、网关于一体的Docker解决方案

<kbd>2.4.22</kbd> • [官网链接](https://github.com/metatool-ai/metamcp)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/higress/README.md">
<img src="./apps/higress/logo.png" width="60" height="60" alt="Higress">
<br><b>Higress</b>
</a>

🌐 阿里巴巴开源的下一代云原生网关

<kbd>latest</kbd> • [官网链接](https://github.com/alibaba/higress)

</td>
<td width="33%" align="center">

<a href="./apps/searxng/README.md">
<img src="./apps/searxng/logo.png" width="60" height="60" alt="SearXNG">
<br><b>SearXNG</b>
</a>

🔍 开源无广告元搜索引擎，保护隐私无追踪，支持自建部署

<kbd>2026.6.30-d115c61a7</kbd> • [官网链接](https://docs.searxng.org/)

</td>
<td width="33%" align="center">

<a href="./apps/chatnio/README.md">
<img src="./apps/chatnio/logo.png" width="60" height="60" alt="ChatNio">
<br><b>ChatNio</b>
</a>

💬 下一代 AI 一站式解决方案，综合性 AI 服务管理平台

<kbd>4.25.0</kbd> • [官网链接](https://chatnio.net)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/langflow/README.md">
<img src="./apps/langflow/logo.png" width="60" height="60" alt="Langflow">
<br><b>Langflow</b>
</a>

🔮 强大的AI应用构建平台，可视化设计AI驱动的工作流和代理

<kbd>1.10.1</kbd> • [官网链接](https://langflow.org/)

</td>
<td width="33%" align="center">

<a href="./apps/litellm/README.md">
<img src="./apps/litellm/logo.png" width="60" height="60" alt="LiteLLM">
<br><b>LiteLLM</b>
</a>

🔧 使用OpenAI格式统一调用所有LLM API，支持多种云服务商

<kbd>1.90.0</kbd> • [官网链接](https://github.com/BerriAI/litellm)

</td>
<td width="33%" align="center">

<a href="./apps/n8n-zh/README.md">
<img src="./apps/n8n-zh/logo.png" width="60" height="60" alt="n8n-zh">
<br><b>n8n-zh</b>
</a>

🔄 n8n汉化版，具有原生AI能力的Fair-code工作流自动化平台

<kbd>2.29.0</kbd> • [官网链接](https://n8n.io/)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/next-ai-draw-io/README.md">
<img src="./apps/next-ai-draw-io/logo.png" width="60" height="60" alt="Next-AI-Draw-IO">
<br><b>Next AI Draw.io</b>
</a>

🤖 AI驱动的图表创建工具

<kbd>0.4.15</kbd> • [官网链接](https://next-ai-drawio.jiang.jp/)

</td>
<td width="33%" align="center">

<a href="./apps/open-notebook/README.md">
<img src="./apps/open-notebook/logo.png" width="60" height="60" alt="Open-Notebook">
<br><b>Open Notebook</b>
</a>

📝 私有的、多模型的Google Notebook LM替代方案，支持多模态内容和AI播客生成

<kbd>1.10.0</kbd> • [官网链接](https://www.open-notebook.ai/)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/sub2api/README.md">
<img src="./apps/sub2api/logo.png" width="60" height="60" alt="Sub2API">
<br><b>Sub2API</b>
</a>

🍥 AI API 网关平台，支持订阅配额分发、API Key 管理、计费和负载均衡

<kbd>0.1.141</kbd> • [官网链接](https://sub2api.org)

</td>
<td width="33%" align="center">

<a href="./apps/cliproxyapi-plus/README.md">
<img src="./apps/cliproxyapi-plus/logo.png" width="60" height="60" alt="CLIProxyAPI Plus">
<br><b>CLIProxyAPI Plus</b>
</a>

🔗 CLIProxyAPI Plus 代理API服务

<kbd>6.9.28-0</kbd> • [官网链接](https://github.com/router-for-me/CLIProxyAPIPlus)

</td>
<td width="33%" align="center">

<a href="./apps/trae-proxy/README.md">
<img src="./apps/trae-proxy/logo.png" width="60" height="60" alt="Trae-Proxy">
<br><b>Trae-Proxy</b>
</a>

🎯 一个智能的API代理工具，专门用于拦截和重定向OpenAI API请求到自定义后端服务

<kbd>1.0.0</kbd> • [官网链接](https://github.com/arch3rPro/Trae-Proxy)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/9router/README.md">
<img src="./apps/9router/logo.png" width="60" height="60" alt="9Router">
<br><b>9Router</b>
</a>

🚀 免费 AI 路由器和 Token 节省工具

<kbd>0.5.15</kbd> • [官网链接](https://9router.com)

</td>
<td width="33%" align="center">

<a href="./apps/apipark/README.md">
<img src="./apps/apipark/logo.png" width="60" height="60" alt="APIPark">
<br><b>APIPark</b>
</a>

🌐 开源企业级 API 全生命周期管理平台

<kbd>1.9.6-beta</kbd> • [官网链接](https://apipark.com)

</td>
<td width="33%" align="center">

<a href="./apps/axonhub/README.md">
<img src="./apps/axonhub/logo.png" width="60" height="60" alt="AxonHub">
<br><b>AxonHub</b>
</a>

🤖 一站式AI开发平台 - 统一API网关

<kbd>0.9.43</kbd> • [官网链接](https://github.com/looplj/axonhub)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/browser-use/README.md">
<img src="./apps/browser-use/logo.png" width="60" height="60" alt="Browser Use">
<br><b>Browser Use</b>
</a>

🌐 让 AI 代理可以访问网站，轻松实现在线任务自动化

<kbd>latest</kbd> • [官网链接](https://browser-use.com/)

</td>
<td width="33%" align="center">

<a href="./apps/claude-code-hub/README.md">
<img src="./apps/claude-code-hub/logo.png" width="60" height="60" alt="Claude Code Hub">
<br><b>Claude Code Hub</b>
</a>

🔗 智能 AI API 代理中转服务平台

<kbd>0.7.4</kbd> • [官网链接](https://github.com/ding113/claude-code-hub)

</td>
<td width="33%" align="center">

<a href="./apps/craft-agents/README.md">
<img src="./apps/craft-agents/logo.png" width="60" height="60" alt="Craft Agents">
<br><b>Craft Agents</b>
</a>

🤖 AI Agent工作空间，支持多LLM提供商和MCP集成

<kbd>0.9.2</kbd> • [官网链接](https://github.com/lukilabs/craft-agents-oss)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/firecrawl/README.md">
<img src="./apps/firecrawl/logo.png" width="60" height="60" alt="Firecrawl">
<br><b>Firecrawl</b>
</a>

🔥 将任意网站转换为适合大语言模型的结构化数据

<kbd>v2.10.0</kbd> • [官网链接](https://www.firecrawl.dev)

</td>
<td width="33%" align="center">

<a href="./apps/hermes-web-ui/README.md">
<img src="./apps/hermes-web-ui/logo.png" width="60" height="60" alt="Hermes Web UI">
<br><b>Hermes Web UI</b>
</a>

🧭 Hermes Agent 的全功能 Web 管理面板

<kbd>0.6.22</kbd> • [官网链接](https://github.com/EKKOLearnAI/hermes-web-ui)

</td>
<td width="33%" align="center">

<a href="./apps/mcphub/README.md">
<img src="./apps/mcphub/logo.png" width="60" height="60" alt="MCPHub">
<br><b>MCPHub</b>
</a>

🔌 MCP 服务器统一管理中心

<kbd>1.0.21</kbd> • [官网链接](https://docs.mcphub.app)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/playwright-mcp/README.md">
<img src="./apps/playwright-mcp/logo.png" width="60" height="60" alt="Playwright MCP">
<br><b>Playwright MCP</b>
</a>

🎭 提供浏览器自动化功能的 MCP 服务器

<kbd>0.0.77</kbd> • [官网链接](https://github.com/microsoft/playwright-mcp)

</td>
<td width="33%" align="center">

<a href="./apps/vane/README.md">
<img src="./apps/vane/logo.png" width="60" height="60" alt="Vane">
<br><b>Vane</b>
</a>

🔍 专注于隐私的 AI 问答搜索引擎

<kbd>v1.12.2</kbd> • [官网链接](https://github.com/ItzCrazyKns/Vane)

</td>
</tr>
</table>

#### 🎵 多媒体管理

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/xiaomusic/README.md">
<img src="./apps/xiaomusic/logo.png" width="60" height="60" alt="XiaoMusic">
<br><b>XiaoMusic</b>
</a>

🎵 使用小爱/红米音箱播放音乐，支持yt-dlp下载

<kbd>0.6.1</kbd> • [官网链接](https://github.com/hanxi/xiaomusic)

</td>
<td width="33%" align="center">

<a href="./apps/openlist/README.md">
<img src="./apps/openlist/logo.png" width="60" height="60" alt="OpenList">
<br><b>OpenList</b>
</a>

📁 开源支持多存储的文件列表程序和私人网盘

<kbd>4.2.2-ffmpeg</kbd> • [官网链接](https://github.com/OpenListTeam/OpenList)

</td>
<td width="33%" align="center">

<a href="./apps/piclist/README.md">
<img src="./apps/piclist/logo.png" width="60" height="60" alt="PicList">
<br><b>PicList</b>
</a>

🖼️ 高效云存储和图床平台管理工具

<kbd>2.4.2</kbd> • [官网链接](https://github.com/Kuingsmile/PicList)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/nzbget/README.md">
<img src="./apps/nzbget/logo.png" width="60" height="60" alt="NZBGet">
<br><b>NZBGet</b>
</a>

📥 高性能Usenet下载工具，支持Web界面管理

<kbd>26.2</kbd> • [官网链接](https://nzbget.net/)

</td>
<td width="33%" align="center">

<a href="./apps/transmission/README.md">
<img src="./apps/transmission/logo.png" width="60" height="60" alt="Transmission">
<br><b>Transmission</b>
</a>

🌱 开源高性能BT/PT下载工具，支持Web界面

<kbd>2021.11.18</kbd> • [官网链接](https://transmissionbt.com/)

</td>
<td width="33%" align="center">

<a href="./apps/moontv/README.md">
<img src="./apps/moontv/logo.png" width="60" height="60" alt="MoonTV">
<br><b>MoonTV</b>
</a>

🎬 开箱即用的跨平台影视聚合播放器，支持多源搜索和在线播放

<kbd>100.1.3</kbd> • [官网链接](https://github.com/MoonTechLab/LunaTV)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/lxserver/README.md">
<img src="./apps/lxserver/logo.png" width="60" height="60" alt="LXServer">
<br><b>LXServer</b>
</a>

🎵 LX Music 数据同步服务器与 Web 播放器

<kbd>1.9.4</kbd> • [官网链接](https://xcq0607.github.io/lxserver/)

</td>
</tr>
</table>

#### ⚡ 运维监控

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/nezha/README.md">
<img src="./apps/nezha/logo.png" width="60" height="60" alt="Nezha">
<br><b>Nezha</b>
</a>

📊 开源轻量易用的服务器监控运维工具

<kbd>2.0.12</kbd> • [官网链接](https://github.com/naiba/nezha/)

</td>
<td width="33%" align="center">

<a href="./apps/glance-agent/README.md">
<img src="./apps/glance-agent/logo.png" width="60" height="60" alt="Glance-Agent">
<br><b>Glance-Agent</b>
</a>

👁️ 轻量级可视化综合服务器监控方案

<kbd>0.1.0</kbd> • [官网链接](https://github.com/arch3rPro/Glance-Monitor)

</td>
<td width="33%" align="center">

<a href="./apps/next-terminal/README.md">
<img src="./apps/next-terminal/logo.png" width="60" height="60" alt="Next-Terminal">
<br><b>Next-Terminal</b>
</a>

🖥️ 简单好用安全的开源交互审计系统

<kbd>3.4.2</kbd> • [官网链接](https://github.com/dushixiang/next-terminal)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/netdata/README.md">
<img src="./apps/netdata/logo.png" width="60" height="60" alt="Netdata">
<br><b>Netdata</b>
</a>

📈 Linux性能实时监测工具，全方位性能监控

<kbd>2.2.6</kbd> • [官网链接](https://github.com/netdata/netdata)

</td>
<td width="33%" align="center">

<a href="./apps/remmina/README.md">
<img src="./apps/remmina/logo.png" width="60" height="60" alt="Remmina">
<br><b>Remmina</b>
</a>

🖥️ 开源跨平台远程桌面客户端，支持多种协议

<kbd>1.4.43</kbd> • [官网链接](https://remmina.org/)

</td>
<td width="33%" align="center">

<a href="./apps/git-sync/README.md">
<img src="./apps/git-sync/logo.png" width="60" height="60" alt="Git-Sync">
<br><b>Git-Sync</b>
</a>

🔄 多平台Git仓库自动同步与备份工具，支持定时任务和Docker部署

<kbd>0.21.0</kbd> • [官网链接](https://github.com/AkashRajpurohit/git-sync)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/tianji/README.md">
<img src="./apps/tianji/logo.png" width="60" height="60" alt="Tianji">
<br><b>Tianji</b>
</a>

📊 开源 all-in-one 数据洞察中心，集成网站分析、服务监控、服务器状态监控

<kbd>1.32.13</kbd> • [官网链接](https://tianji.msgbyte.com/)

</td>
<td width="33%" align="center">

<a href="./apps/beszel-agent/README.md">
<img src="./apps/beszel-agent/logo.png" width="60" height="60" alt="Beszel-Agent">
<br><b>Beszel-Agent</b>
</a>

⚡ 轻量级服务器监控代理，支持实时性能数据收集

<kbd>0.18.7</kbd> • [官网链接](https://github.com/henrygd/beszel)

</td>
<td width="33%" align="center">

<a href="./apps/docker-socket-proxy/README.md">
<img src="./apps/docker-socket-proxy/logo.png" width="60" height="60" alt="Docker-Socket-Proxy">
<br><b>Docker-Socket-Proxy</b>
</a>

🔒 Docker socket代理，支持访问规则限制和权限控制

<kbd>3.2.9</kbd> • [官网链接](https://github.com/Tecnativa/docker-socket-proxy)

</td>
</tr>
</table>

#### 🗄️ Nas工具

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/resilio-sync/README.md">
<img src="./apps/resilio-sync/logo.png" width="60" height="60" alt="Resilio-Sync">
<br><b>Resilio-Sync</b>
</a>

🔄 跨平台P2P文件同步和分享工具

<kbd>3.1.2</kbd> • [官网链接](https://www.resilio.com/sync/)

</td>
<td width="33%" align="center">

<a href="./apps/adguardhome-sync/README.md">
<img src="./apps/adguardhome-sync/logo.png" width="60" height="60" alt="AdGuardHome-Sync">
<br><b>AdGuardHome-Sync</b>
</a>

🔄 多AdGuardHome实例间配置同步工具

<kbd>0.9.2</kbd> • [官网链接](https://github.com/bakito/adguardhome-sync)

</td>
<td width="33%" align="center">

<a href="./apps/pairdrop/README.md">
<img src="./apps/pairdrop/logo.png" width="60" height="60" alt="PairDrop">
<br><b>PairDrop</b>
</a>

📱 类AirDrop工具，支持网络文件、文本共享

<kbd>1.11.2</kbd> • [官网链接](https://github.com/schlagmichdoch/PairDrop)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/kspeeder/README.md">
<img src="./apps/kspeeder/logo.png" width="60" height="60" alt="KSpeeder">
<br><b>KSpeeder</b>
</a>

🔄 Docker 镜像加速与私有部署服务，支持多平台和多架构

<kbd>0.7.10</kbd> • [官网链接](https://kspeeder.istoreos.com/)

</td>
<td width="33%" align="center">

<a href="./apps/lucky/README.md">
<img src="./apps/lucky/logo.png" width="60" height="60" alt="Lucky">
<br><b>Lucky</b>
</a>

⚡ 多功能端口转发、流量转发、WAF、防火墙与备份工具，支持多平台部署

<kbd>latest</kbd> • [官网链接](https://github.com/gdy666/lucky)

</td>
<td width="33%" align="center">

<a href="./apps/starvpn/README.md">
<img src="./apps/starvpn/logo.png" width="60" height="60" alt="StarVPN">
<br><b>星空组网（StarVPN）</b>
</a>

🌌 简单易用的自托管VPN服务，支持多平台和Docker快速部署

<kbd>6.0.7</kbd> • [官网链接](https://github.com/starvpn/starvpn)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/ani-rss/README.md">
<img src="./apps/ani-rss/logo.png" width="60" height="60" alt="ANI-RSS">
<br><b>ANI-RSS</b>
</a>

📺 动漫自动订阅与下载工具，支持多平台和主流下载器，适合NAS自动追番

<kbd>4.0.3</kbd> • [官网链接](https://github.com/wushuo894/ani-rss)

</td>
<td width="33%" align="center">

<a href="./apps/jdxb/README.md">
<img src="./apps/jdxb/logo.png" width="60" height="60" alt="JDxB">
<br><b>节点小宝（JDxB）</b>
</a>

🛰️ 多平台远程管理与网络加速工具，支持内网穿透、异地组网和文件备份

<kbd>latest</kbd> • [官网链接](https://github.com/ionewu/owjdxb)

</td>
<td width="33%" align="center">

<a href="./apps/verysync/README.md">
<img src="./apps/verysync/logo.png" width="60" height="60" alt="Verysync">
<br><b>微力同步（Verysync）</b>
</a>

🔄 基于P2P的极速文件同步工具，支持多平台和多架构，适合家庭与企业备份

<kbd>2.21.3</kbd> • [官网链接](https://github.com/Jonnyan404/verysync)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/keepassxc/README.md">
<img src="./apps/keepassxc/logo.png" width="60" height="60" alt="KeePassXC">
<br><b>KeePassXC</b>
</a>

🔐 跨平台开源密码管理器，支持Web界面和多种平台，安全可靠

<kbd>2.7.12</kbd> • [官网链接](https://keepassxc.org/)

</td>
<td width="33%" align="center">

<a href="./apps/pansou/README.md">
<img src="./apps/pansou/logo.png" width="60" height="60" alt="PanSou">
<br><b>PanSou</b>
</a>

🔍 高性能网盘资源搜索API服务，支持TG频道和插件搜索，智能排序和网盘类型分类

<kbd>sha-fb7fec2</kbd> • [官网链接](https://github.com/fish2018/pansou)

</td>
<td width="33%" align="center">

<a href="./apps/it-tools/README.md">
<img src="./apps/it-tools/logo.png" width="60" height="60" alt="IT-Tools">
<br><b>IT-Tools</b>
</a>

🛠️ 为开发人员和IT从业者提供的在线工具集合，支持加密、转换、Web、图像等多类工具

<kbd>2025.8.31-13b8f041</kbd> • [官网链接](https://github.com/sharevb/it-tools)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/1panel-tools/README.md">
<img src="./apps/1panel-tools/logo.png" width="60" height="60" alt="1Panel-Tools">
<br><b>1Panel-Tools</b>
</a>

🔧 轻松将您的 Docker Compose 文件转换为 1Panel 应用商店格式

<kbd>0.3.0</kbd> • [官网链接](https://github.com/arch3rPro/1Panel-Tools)

</td>
<td width="33%" align="center">

<a href="./apps/omnitools/README.md">
<img src="./apps/omnitools/logo.png" width="60" height="60" alt="OmniTools">
<br><b>OmniTools</b>
</a>

🛠️ 功能强大的日常任务网络工具，自托管无广告追踪

<kbd>0.6.0</kbd> • [官网链接](https://omnitools.app/)

</td>
<td width="33%" align="center">

<a href="./apps/playwright/README.md">
<img src="./apps/playwright/logo.png" width="60" height="60" alt="Playwright">
<br><b>Playwright</b>
</a>

🎭 专业的 Web 应用自动化测试环境，支持多浏览器

<kbd>1.55.0-noble</kbd> • [官网链接](https://playwright.dev/)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/fast-note-sync-service/README.md">
<img src="./apps/fast-note-sync-service/logo.png" width="60" height="60" alt="Fast Note Sync Service">
<br><b>Fast Note Sync Service</b>
</a>

📝 高性能低延迟的 Obsidian 笔记同步服务

<kbd>3.4.0</kbd> • [官网链接](https://github.com/haierkeys/fast-note-sync-service)

</td>
<td width="33%" align="center">

<a href="./apps/trendradar/README.md">
<img src="./apps/trendradar/logo.png" width="60" height="60" alt="TrendRadar">
<br><b>TrendRadar</b>
</a>

📡 多平台热点推送

<kbd>6.10.0</kbd> • [官网链接](https://github.com/sansan0/TrendRadar)

</td>
</tr>
</table>

#### 🐳 容器管理

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/cup/README.md">
<img src="./apps/cup/logo.png" width="60" height="60" alt="Cup">
<br><b>Cup</b>
</a>

🔄 支持Web和Cli方式检查容器镜像更新

<kbd>3.5.1</kbd> • [官网链接](https://github.com/sergi0g/cup/)

</td>
<td width="33%" align="center">

<a href="./apps/docker-copilot/README.md">
<img src="./apps/docker-copilot/logo.png" width="60" height="60" alt="Docker-Copilot">
<br><b>Docker-Copilot</b>
</a>

🚀 主打便捷的docker容器管理工具，一键更新容器

<kbd>latest</kbd> • [官网链接](https://github.com/onlyLTY/dockerCopilot)

</td>
<td width="33%" align="center">

<a href="./apps/wud/README.md">
<img src="./apps/wud/logo.png" width="60" height="60" alt="Wud">
<br><b>Wud</b>
</a>

🔄 监控Docker基础镜像自动更新

<kbd>8.2.2</kbd> • [官网链接](https://github.com/sergi0g/cup/)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/hubcmdui/README.md">
<img src="./apps/hubcmdui/logo.png" width="60" height="60" alt="Hubcmd-UI">
<br><b>Hubcmd-UI</b>
</a>

⚡ Docker镜像加速命令查询获取、镜像搜索、配置教程文档展示UI面板

<kbd>4.1.2</kbd> • [官网链接](https://github.com/dqzboy/Docker-Proxy)

</td>
<td width="33%" align="center">

<a href="./apps/diun/README.md">
<img src="./apps/diun/logo.png" width="60" height="60" alt="Diun">
<br><b>Diun</b>
</a>

🔔 Docker镜像更新监控和通知工具

<kbd>4.33.0</kbd> • [官网链接](https://github.com/crazy-max/diun)

</td>
<td width="33%" align="center">

<a href="./apps/arcane/README.md">
<img src="./apps/arcane/logo.png" width="60" height="60" alt="Arcane">
<br><b>Arcane</b>
</a>

🧙‍♂️ 现代化开源Docker管理Web面板

<kbd>1.9.0</kbd> • [官网链接](https://arcane.ofkm.dev/)

</td>
</tr>
</table>

<table>
<tr>
<td width="33%" align="center">

<a href="./apps/dpanel/README.md">
<img src="./apps/dpanel/logo.png" width="60" height="60" alt="DPanel">
<br><b>DPanel</b>
</a>

🐳 轻量化 docker 可视化管理面板

<kbd>1.10.5-lite</kbd> • [官网链接](https://dpanel.cc/)

</td>
</tr>
</table>

<!-- 橙色风格 -->

!\[Copyright-arch3rPro]\(<https://img.shields.io/badge/Copyright-arch3rPro-ff9800?style=flat&logo=github&logoColor=white> null)
