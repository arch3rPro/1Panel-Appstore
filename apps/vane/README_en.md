# Vane 🔍

Vane is a **privacy-focused AI answering engine** that runs entirely on your own hardware. It combines knowledge from the vast internet with support for **local LLMs** (Ollama) and cloud providers (OpenAI, Claude, Groq), delivering accurate answers with **cited sources** while keeping your searches completely private.

## Features

🤖 **Support for all major AI providers** - Use local LLMs through Ollama or connect to OpenAI, Anthropic Claude, Google Gemini, Groq, and more. Mix and match models based on your needs.

⚡ **Smart search modes** - Choose Speed Mode when you need quick answers, Balanced Mode for everyday searches, or Quality Mode for deep research.

🧭 **Pick your sources** - Search the web, discussions, or academic papers. More sources and integrations are in progress.

🧩 **Widgets** - Helpful UI cards that show up when relevant, like weather, calculations, stock prices, and other quick lookups.

🔍 **Web search powered by SearxNG** - Access multiple search engines while keeping your identity private. Support for Tavily and Exa coming soon.

📷 **Image and video search** - Find visual content alongside text results. Search isn't limited to just articles anymore.

📄 **File uploads** - Upload documents and ask questions about them. PDFs, text files, images - Vane understands them all.

🌐 **Search specific domains** - Limit your search to specific websites when you know where to look. Perfect for technical documentation or research papers.

💡 **Smart suggestions** - Get intelligent search suggestions as you type, helping you formulate better queries.

📚 **Discover** - Browse interesting articles and trending content throughout the day. Stay informed without even searching.

🕒 **Search history** - Every search is saved locally so you can revisit your discoveries anytime. Your research is never lost.

## Usage

### Default Port

- Web UI: 3000

### Data Directory

Application data is stored in the `./data` directory.

### Configuration

After deployment, open your browser and navigate to `http://localhost:3000` to configure your API keys, models, and other settings in the setup screen.

If you already have a SearxNG instance, you can set the `SEARXNG_API_URL` environment variable to point to your SearxNG URL.

### Local LLM Support

If using local LLMs like Ollama, ensure that:

- Your server is running on `0.0.0.0` (not `127.0.0.1`)
- You have correctly configured the API URL and model name in settings
- Linux users need to configure `OLLAMA_HOST=0.0.0.0:11434`

## Links

- GitHub: https://github.com/ItzCrazyKns/Vane
- Documentation: https://github.com/ItzCrazyKns/Vane/tree/master/docs
