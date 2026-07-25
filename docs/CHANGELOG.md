# Changelog

All notable changes to the MetaPilot platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-24

### Added
- **ChromaDB Vector persistent Store**: Replaced manual temporary memory search arrays with a production-ready persistent Chroma vector database utilizing local `SentenceTransformers` (`all-MiniLM-L6-v2`) embeddings.
- **Resilient SQLite Fallback**: Engineered a backup retrieval store using Python-calculated cosine similarities on a local SQLite instance to ensure operations run without warnings even on compilation failures.
- **RAG Reasoning Agent Orchestrator**: Modular ProviderFactory supporting Google Gemini, OpenAI, and Groq APIs with versioned PromptEngine templates and context assembly algorithms.
- **Code automation engines**: Implemented SQL query builder, dbt schema config compiler, and Airflow TaskFlow DAG generator.
- **Interactive Multi-Pane UI**: Split-screen web workspace showing real-time SSE stream responses, telemetry logs, and a code editor.
- **Diagnostics Observability Panel**: Telemetry displays showing input/output token counts, execution latency breakdowns, validation results, and trust scores.
- **Hackathon Judge Mode**: Persistent LocalStorage settings toggling that auto-expands the RAG telemetry panels for reviewers.
- **DataHub Integrations**: Ingested Snowflake & PostgreSQL schemas via GraphQL API endpoints, mapping upstream/downstream lineage dependencies.
- **Model Context Protocol (MCP)**: Implemented an MCP server adapter exposing tools (`get_schema_fields`, `get_lineage_relations`) to AI models.

### Fixed
- Fixed TypeScript compiler warnings in `src/pages/WorkspacePage.tsx` and custom state providers.
- Cleaned up console debugging logs and residual print lines across routes.
- Standardized async-await database transactions.
