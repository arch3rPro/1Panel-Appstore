# Dify

Dify is an open-source LLM application development platform with AI workflows, RAG pipelines, agents, model management, and observability.

## Deployment Notes

This package deploys Dify with Docker Compose and exposes the web entry through the Nginx service. Configure the HTTP and HTTPS ports in 1Panel during installation.

### Weaviate upgrade (1.27.0 → 1.39.13)

The bundled Weaviate vector store was upgraded from 1.27.0 to 1.39.13. Data in `volumes/weaviate` is kept, but back it up before upgrading: Weaviate recommends moving one minor version at a time. Vectors that Dify wrote while running Weaviate 1.27.0 may not be found by semantic search; if retrieval returns nothing after the upgrade, re-index the affected knowledge bases.

## Official Resources

- Website: [https://dify.ai/](https://dify.ai/)
- GitHub: [https://github.com/langgenius/dify](https://github.com/langgenius/dify)
- Documentation: [https://docs.dify.ai/](https://docs.dify.ai/)
