# Firecrawl

Turn any website into LLM-ready structured data. A powerful web scraping, crawling, search and data extraction platform.

## Features

- **Single Page Scraping**: Convert any URL to Markdown, HTML, screenshots, or structured JSON
- **Multi-Page Crawling**: Recursively scrape entire websites with intelligent link filtering
- **URL Discovery**: Discover all URLs on a website instantly via sitemaps, index queries, or search
- **Web Search**: Search the web and get full page content from results in a single call
- **AI Extraction**: LLM-powered structured data extraction with schema validation
- **Autonomous Agent**: AI research agent that automatically navigates and extracts data
- **Remote Browser**: Remote browser sessions with CDP access and code execution
- **Batch Operations**: Asynchronous bulk scraping of multiple URLs
- **Self-Hosted**: Fully open source, supports local deployment with complete data control

## Usage

### Default Port

- API Service: 3002
- Queue Admin UI: http://your-ip:3002/admin/YOUR_BULL_AUTH_KEY/queues

### API Access

After deployment, access the API at `http://your-ip:3002`.

Test the crawl endpoint:
```bash
curl -X POST http://localhost:3002/v1/crawl \
    -H 'Content-Type: application/json' \
    -d '{
      "url": "https://firecrawl.dev"
    }'
```

### Data Directories

Application data is stored in the following directories:
- `./data/api` - API service data
- `./data/postgres` - PostgreSQL database data
- `./data/redis` - Redis cache data
- `./data/playwright` - Playwright browser cache

### Environment Variables

- `POSTGRES_USER` / `POSTGRES_PASSWORD`: PostgreSQL database credentials
- `BULL_AUTH_KEY`: Access key for the queue admin UI
- `OPENAI_API_KEY`: OpenAI API key for AI-powered features (optional)

### Architecture

The self-hosted version includes the following service components:
- **API Service**: Main API server handling all requests (4 CPU cores, 8GB RAM limit)
- **Playwright Service**: Browser automation service (2 CPU cores, 4GB RAM limit)
- **Redis**: Job queue and cache backend
- **RabbitMQ**: NuQ message broker
- **PostgreSQL**: Job state management database

## Links

- Website: https://www.firecrawl.dev
- GitHub: https://github.com/firecrawl/firecrawl
- Documentation: https://docs.firecrawl.dev
- Discord: https://discord.gg/firecrawl
