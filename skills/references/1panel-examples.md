# 1Panel 应用商店参考示例

本文件包含从 1Panel-Appstore 和 appstore 官方仓库提取的实际应用配置示例。

## 目录

1. [简单单服务应用](#简单单服务应用)
2. [带数据库的应用](#带数据库的应用)
3. [多端口应用](#多端口应用)
4. [多服务应用](#多服务应用)
5. [常见标签分类](#常见标签分类)

---

## 简单单服务应用

### 示例：AList

**目录结构：**
```
alist/
├── logo.png
├── data.yml           # 顶层元数据
├── README.md
├── README_en.md
└── 3.45.0/            # 版本目录
    ├── data.yml       # 参数定义
    ├── docker-compose.yml
    └── data/          # 数据目录
```

**顶层 data.yml：**
```yaml
name: AList
tags:
    - 实用工具
    - 云存储
title: 支持多存储的文件列表程序和私人网盘
description: 支持多存储的文件列表程序和私人网盘
additionalProperties:
    key: alist
    name: AList
    tags:
        - Storage
        - Tool
    shortDescZh: 支持多存储的文件列表程序和私人网盘
    shortDescEn: Supporting multi-storage file listing program and private cloud storage
    description:
        en: Supporting multi-storage file listing program and private cloud storage
        ja: 複数ストレージのファイルリスト表示プログラムとプライベートクラウドストレージのサポート
        ms: Menyokong program senarai fail multi-penyimpanan dan penyimpanan awan peribadi
        pt-br: Suporte para programa de listagem de arquivos em múltiplos armazenamentos e armazenamento em nuvem privado
        ru: Поддержка программы отображения файлов в нескольких хранилищах и частного облачного хранилища
        ko: 다중 저장소 파일 목록 프로그램 및 개인 클라우드 저장소 지원
        zh-Hant: 支援多存儲檔案列出程序和私人雲端空間
        zh: 支持多存储文件列出程序和私有云存储
    type: website
    crossVersionUpdate: true
    limit: 0
    recommend: 65
    website: https://alist.nn.ci/
    github: https://github.com/alist-org/alist
    document: https://alist.nn.ci/zh/guide/
    architectures:
      - amd64
      - arm64
      - arm/v7
      - arm/v6
      - s390x
```

**版本 data.yml（参数定义）：**
```yaml
additionalProperties:
    formFields:
        - default: 5244
          edit: true
          envKey: PANEL_APP_PORT_HTTP
          labelEn: WebUI Port
          labelZh: 网页端口
          required: true
          rule: paramPort
          type: number
          label:
            en: WebUI Port
            ja: WebUI ポート
            ms: Port WebUI
            pt-br: Porta WebUI
            ru: Порт WebUI
            ko: WebUI 포트
            zh-Hant: WebUI 埠
            zh: WebUI 端口
        - default: 5426
          edit: true
          envKey: PANEL_APP_PORT_S3
          labelEn: S3 Port
          labelZh: S3 端口
          required: true
          rule: paramPort
          type: number
          label:
            en: S3 Port
            ja: S3 ポート
            ms: Port S3
            pt-br: Porta S3
            ru: Порт S3
            ko: S3 포트
            zh-Hant: S3 埠
            zh: S3 端口
```

**docker-compose.yml：**
```yaml
services:
  alist:
    container_name: ${CONTAINER_NAME}
    restart: always
    networks:
      - 1panel-network
    ports:
      - "${PANEL_APP_PORT_HTTP}:5244"
      - "${PANEL_APP_PORT_S3}:5426"
    volumes:
      - ./data/data:/opt/alist/data
      - ./data/mnt:/mnt/data
    environment:
      - PUID=0
      - PGID=0
      - UMASK=022
    image: xhofe/alist:v3.45.0
    labels:  
      createdBy: "Apps"
networks:  
  1panel-network:  
    external: true
```

---

## 带数据库的应用

### 示例：NocoDB（PostgreSQL）

**docker-compose.yml：**
```yaml
services:
  nocodb:
    container_name: ${CONTAINER_NAME}
    restart: always
    networks:
      - 1panel-network
    ports:
      - "${PANEL_APP_PORT_HTTP}:8080"
    volumes:
      - ./data/nocodb:/usr/app/data
    environment:
      - NC_DB=pg://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - NC_AUTH_JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
    image: nocodb/nocodb:0.258.2
    labels:
      createdBy: "Apps"
  db:
    image: postgres:16-alpine
    restart: always
    networks:
      - 1panel-network
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5
networks:
  1panel-network:
    external: true
```

**参数定义：**
```yaml
- default: 8080
  edit: true
  envKey: PANEL_APP_PORT_HTTP
  labelEn: Web Port
  labelZh: Web端口
  required: true
  rule: paramPort
  type: number
- default: nocodb
  edit: true
  envKey: DB_NAME
  labelEn: Database Name
  labelZh: 数据库名称
  required: true
  rule: paramCommon
  type: text
- default: nocodb
  edit: true
  envKey: DB_USER
  labelEn: Database User
  labelZh: 数据库用户
  required: true
  rule: paramCommon
  type: text
- default: nocodb_password
  edit: true
  envKey: DB_PASSWORD
  labelEn: Database Password
  labelZh: 数据库密码
  required: true
  rule: paramCommon
  type: password
```

---

## 多端口应用

### 示例：Nginx Proxy Manager

**参数定义：**
```yaml
formFields:
  - default: 81
    edit: true
    envKey: PANEL_APP_PORT_HTTP
    labelEn: Admin Port
    labelZh: 管理端口
    required: true
    rule: paramPort
    type: number
  - default: 80
    edit: true
    envKey: PANEL_APP_PORT_NGINX_HTTP
    labelEn: HTTP Port
    labelZh: HTTP端口
    required: true
    rule: paramPort
    type: number
  - default: 443
    edit: true
    envKey: PANEL_APP_PORT_NGINX_HTTPS
    labelEn: HTTPS Port
    labelZh: HTTPS端口
    required: true
    rule: paramPort
    type: number
```

**docker-compose.yml：**
```yaml
services:
  app:
    container_name: ${CONTAINER_NAME}
    restart: always
    networks:
      - 1panel-network
    ports:
      - "${PANEL_APP_PORT_HTTP}:81"
      - "${PANEL_APP_PORT_NGINX_HTTP}:80"
      - "${PANEL_APP_PORT_NGINX_HTTPS}:443"
    volumes:
      - ./data/data:/data
      - ./data/letsencrypt:/etc/letsencrypt
    image: jc21/nginx-proxy-manager:latest
    labels:
      createdBy: "Apps"
networks:
  1panel-network:
    external: true
```

---

## 多服务应用

### 示例：Dify（完整栈）

**docker-compose.yml：**
```yaml
services:
  api:
    container_name: ${CONTAINER_NAME}
    restart: always
    networks:
      - 1panel-network
    ports:
      - "${PANEL_APP_PORT_HTTP}:80"
    volumes:
      - ./data/storage:/app/api/storage
    environment:
      - MODE=api
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    image: langgenius/dify-api:latest
    labels:
      createdBy: "Apps"
  worker:
    restart: always
    networks:
      - 1panel-network
    environment:
      - MODE=worker
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    image: langgenius/dify-api:latest
  db:
    image: postgres:15-alpine
    restart: always
    networks:
      - 1panel-network
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - 1panel-network
    volumes:
      - ./data/redis:/data
networks:
  1panel-network:
    external: true
```

---

## 常见标签分类

### 中文标签（tags）

| 分类 | 标签 |
|------|------|
| 开发工具 | 开发工具 |
| 实用工具 | 实用工具 |
| 文档与笔记 | 文档与笔记 |
| 云存储 | 云存储 |
| 数据库 | 数据库 |
| 监控运维 | 监控运维 |
| 安全工具 | 安全工具 |
| 网络工具 | 网络工具 |
| 建站工具 | 建站工具 |
| AI/LLM | AI/LLM |
| 容器管理 | 容器管理 |

### 英文标签（additionalProperties.tags）

| 分类 | 标签 |
|------|------|
| 开发工具 | DevTool |
| 实用工具 | Utility |
| 文档与笔记 | Note |
| 云存储 | Storage |
| 数据库 | Database |
| 监控运维 | Monitor |
| 安全工具 | Security |
| 网络工具 | Network |
| 建站工具 | Website |
| AI/LLM | AI |
| 容器管理 | Container |

### 应用类型（type）

| 类型 | 说明 |
|------|------|
| website | Web应用（默认） |
| runtime | 运行时环境（数据库等） |
| tool | 命令行工具 |

---

## 最佳实践

1. **版本号**：使用实际的镜像标签版本，如 `v3.45.0`，而非 `latest`
2. **推荐值**：优质应用设置 recommend: 60-80，一般应用 30-50
3. **架构支持**：至少支持 amd64 和 arm64
4. **多语言**：至少提供中英文描述，推荐添加日韩俄等语言
5. **数据持久化**：使用 `./data/` 目录，避免绝对路径
6. **环境变量**：敏感信息使用 password 类型参数
