<div align="center">

<!-- Hero Banner Placeholder -->
<img src="https://raw.githubusercontent.com/username/project/main/assets/metapilot-hero-banner.png" alt="MetaPilot Banner" width="100%" style="border-radius: 8px; margin-bottom: 20px;" />

# 🧭 MetaPilot

### *Navigate Data. Build Smarter.*

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python Version](https://img.shields.io/badge/Python-3.12%2B-brightgreen.svg)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/Node-18%2B-blue.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TS-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![DataHub Integration](https://img.shields.io/badge/Integration-DataHub-cyan.svg)](https://datahubproject.io/)
[![MCP Compliance](https://img.shields.io/badge/Protocol-MCP-orange.svg)](https://modelcontextprotocol.io/)

**MetaPilot** is an enterprise-grade AI Engineering Agent built on DataHub. It combines metadata intelligence, AI reasoning, RAG, MCP integration, lineage analysis, explainability, and engineering automation into a modern, premium platform that helps data engineers understand, analyze, and automate complex data workflows with zero hallucinations.

[Website (Demo)](http://localhost:5173) • [API Specs](http://localhost:8000/docs) • [Architecture Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/Architecture.md) • [Devpost Submission](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/devpost_submission.md)

</div>

---

## 📖 Table of Contents
1. [Overview & Problem Statement](#-overview--problem-statement)
2. [Why MetaPilot?](#-why-metapilot)
3. [Key Features](#-key-features)
4. [Screenshots & Demo](#-screenshots--demo)
5. [Architecture Overview](#-architecture-overview)
6. [Tech Stack](#-tech-stack)
7. [Folder Structure](#-folder-structure)
8. [Installation & Setup](#-installation--setup)
9. [Docker Setup](#-docker-setup)
10. [Environment Variables](#-environment-variables)
11. [Local Development](#-local-development)
12. [Deployment Guide](#-deployment-guide)
13. [Core Integrations](#-core-integrations)
    - [AI Pipeline](#ai-pipeline)
    - [DataHub Integration](#datahub-integration)
    - [MCP Integration](#mcp-integration)
14. [Judge Mode & Explainability](#-judge-mode--explainability)
15. [API Overview](#-api-overview)
16. [Roadmap](#-roadmap)
17. [License](#-license)
18. [Contributors & Acknowledgements](#-contributors--acknowledgements)

---

## 🚨 Overview & Problem Statement

Modern enterprise data environments are incredibly complex, often comprising hundreds of databases, thousands of Snowflake tables, and spaghetti-like dependencies. Data teams lose countless hours:
1. **Tracing Lineage & Impact**: Understanding what downstream tables break if an upstream Snowflake column is modified.
2. **Writing Boilerplate Code**: Manually coding repetitive SQL joins, dbt models, and Airflow DAGs.
3. **Diagnosing Siloed Schemas**: Resolving compiler mismatch failures in SQL models because of inconsistent data type definitions.

While metadata catalogs (like **LinkedIn DataHub**) index catalog properties and map assets, they lack **autonomous intelligence** and actionable engineering capabilities. **MetaPilot** fills this critical gap, acting as a senior AI data engineering companion. By indexing catalog properties in a vector database (ChromaDB) and combining it with LLM reasoning, MetaPilot translates metadata into reliable, production-ready data assets.

---

## 💡 Why MetaPilot?

Unlike generic code generation tools that suffer from hallucinations, MetaPilot grounds all AI outputs directly in the actual schemas, lineage, and ownership data registered in your enterprise data catalog.

* **100% Grounded in Metadata**: Injects exact table structures and lineage contexts from DataHub into the context window, eliminating fictional table names and hallucinated columns.
* **Double-Checked Syntactic Safety**: A built-in validation layer matches the generated outputs against active schemas before rendering.
* **Full MCP Alignment**: Built on the open-source **Model Context Protocol (MCP)**, allowing metadata discovery and lineage tracing to run as isolated tool components.
* **Resilient SQLite Fallback**: Operates flawlessly even if live vector or catalog databases are offline, falling back gracefully to a high-fidelity local SQLite store.

---

## ✨ Key Features

* 🚀 **Code Automation Generators**: Synthesizes custom SQL queries, dbt YAML schema specifications, and Airflow TaskFlow code files based on natural language queries.
* 🌿 **Lineage Impact Traversals**: Programmatically traces upstream and downstream dependencies nodes, assigning risk ratings to schema modifications.
* 👩‍⚖️ **Judge Mode settings overrides**: Persistent local configuration toggling that force-expands diagnostic views for hackathon evaluations.
* 💻 **Interactive Tabbed Workspace**: Split-pane interface displaying AI reasoning chains on the left and syntax-highlighted editor code files on the right.
* 📊 **Diagnostics Explainability**: Complete RAG transparency showing token usage, execution latency breakdowns, and "Why this Answer" logic.
* 🛡️ **Resilient SQLite Fallbacks**: Switches search pipelines to local SQLite storage if ChromaDB or live DataHub service hooks are unconfigured.

---

## 📸 Screenshots & Demo

<!-- Placeholders for Screenshots and Demos -->
<div align="center">

### Demo Walkthrough
[![Demo Video](https://raw.githubusercontent.com/username/project/main/assets/demo-thumbnail.png)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
*Click to play a 3-minute walk-through of the MetaPilot AI workspace, lineage viewer, and explainability features.*

### Interface Previews
| Landing Page | Interactive Workspace |
|:---:|:---:|
| <img src="https://raw.githubusercontent.com/username/project/main/assets/screenshot-landing.png" width="350px" alt="Landing Page" /> | <img src="https://raw.githubusercontent.com/username/project/main/assets/screenshot-workspace.png" width="350px" alt="AI Workspace" /> |
| **Lineage Impact Viewer** | **Explainability & Judge Panel** |
| <img src="https://raw.githubusercontent.com/username/project/main/assets/screenshot-lineage.png" width="350px" alt="Lineage Page" /> | <img src="https://raw.githubusercontent.com/username/project/main/assets/screenshot-judge.png" width="350px" alt="Judge Observability" /> |

</div>

---

## 🏗️ Architecture Overview

MetaPilot relies on a decoupled, three-tier architecture connecting React clients, FastAPI backends, and state/caching/metadata services:

```mermaid
graph TD
  User[Vite + React Client] <-->|HTTPS API / SSE Streams| API[FastAPI Core Server]
  API <-->|State DB| PostgreSQL[(PostgreSQL Store)]
  API <-->|Rate Limit & Cache| Redis[(Redis Cache)]
  API <-->|Metadata Registries| DataHub[DataHub GMS Core]
  API <-->|Vector Database| Chroma[(ChromaDB Persistent Store)]
  API -->|Abstract RAG| LLM[Google Gemini / OpenAI Providers]
```

To see the complete detailed sequence of operations, databases, request lifetimes, and deployment nodes, consult our [Architecture Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/Architecture.md).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS (Harmonious custom HSL colors, modern dark-mode layouts)
- **State & Transitions**: Framer Motion (premium micro-animations), Lucide Icons
- **HTTP Client**: Axios, Server-Sent Events (SSE) for real-time stream processing

### Backend
- **Core API**: FastAPI (Python 3.12+), Uvicorn
- **ORM & DB**: SQLAlchemy v2 (asyncpg), Alembic, Pydantic v2
- **Vector Database**: ChromaDB (with local SQLite fallback engine)
- **Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`)

### Integrations
- **Data Catalog**: LinkedIn DataHub (via GraphQL & REST GMS API)
- **Caching & Rate Limiting**: Redis
- **LLM API Providers**: Google Gemini API (Primary), Groq & OpenAI (Fallbacks)

---

## 📂 Folder Structure

```
MetaPilot/
├── src/                     # React Frontend Source
│   ├── api/                 # Axios clients and SSE listeners
│   ├── components/          # Reusable UI cards, tables, panels
│   ├── hooks/               # Custom React hooks (theme, auth)
│   ├── layouts/             # Shared dashboard and workspace layouts
│   ├── mock/                # Offline testing mocks
│   ├── pages/               # Routing pages (Landing, Workspace, etc.)
│   └── utils/               # Styling helpers and data formatters
├── backend/                 # FastAPI Backend Source
│   ├── app/
│   │   ├── api/             # REST route controllers
│   │   ├── core/            # Configuration and log utilities
│   │   ├── database/        # DB engine, session handlers
│   │   ├── dependencies/    # FastAPI security & verification tokens
│   │   ├── middleware/      # Logging, rate limiter, execution time
│   │   ├── models/          # SQLAlchemy async database schemas
│   │   ├── schemas/         # Pydantic serialization schemas
│   │   ├── integrations/    # DataHub, Redis, and MCP adapters
│   │   └── ai/              # RAG, LLM providers, and templates
│   └── requirements.txt     # Python dependency configuration
├── docs/                    # In-depth architectural & deployment markdown manuals
└── docker-compose.yml       # Dev service orchestration
```

For a comprehensive guide, check the [Folder Structure Document](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/FolderStructure.md).

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **Python**: v3.12.0 or later
- **Docker & Docker Compose**: Needed if you plan to launch local PostgreSQL/Redis nodes.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys (e.g. GEMINI_API_KEY)
   ```
5. Apply database migrations and start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
1. Open a new terminal in the root directory:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:5173`.
   - **Default Login**: `admin@metapilot.io`
   - **Default Password**: `admin123`

---

## 🐳 Docker Setup

To quickly orchestrate PostgreSQL, Redis, and DataHub mock containers for local validation:

1. Start all dependency containers:
   ```bash
   docker-compose up -d
   ```
2. Check logs to confirm startup:
   ```bash
   docker-compose logs -f
   ```
3. To stop container clusters:
   ```bash
   docker-compose down
   ```

---

## ⚙️ Environment Variables

MetaPilot reads configuration settings from `backend/.env`. A summary of core properties:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API credential token | *Required for Live AI* |
| `PRIMARY_AI_PROVIDER` | LLM service provider endpoint (`gemini`, `openai`, `groq`) | `gemini` |
| `DATABASE_URL` | Async PostgreSQL link | `postgresql+asyncpg://postgres:postgres@localhost:5432/metapilot` |
| `REDIS_URL` | Caching endpoint | `redis://localhost:6379/0` |
| `DATAHUB_GMS_URL` | Endpoint of DataHub GraphQL GMS | `http://localhost:8080` |
| `CHROMADB_PERSIST_PATH` | Storage destination of persistent vector database | `./chroma_db` |

Consult the [Environment Variables Index](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/EnvironmentVariables.md) for full descriptions of testing overrides.

---

## 💻 Local Development

* **Mock Ingestion**: Run `python -m app.integrations.datahub.seed` to seed local mock datasets (`users_dim`, `orders_fact`, `stripe_webhook_events`) into the SQLite vector database fallback.
* **Unit Testing**: Run backend test suites:
  ```bash
  cd backend
  pytest
  ```
* **Linting**:
  - Python: `black app/`
  - Frontend: `npm run lint`

---

## ☁️ Deployment Guide

MetaPilot is structured for cloud hosting:
* **Frontend**: Highly optimized static asset distribution on **Vercel**.
* **Backend**: Dockerized Python API server running on **Render** (or AWS ECS).
* **Database**: Managed **PostgreSQL** instance (e.g. AWS RDS or Supabase).
* **Caching**: Key-value instance on **Upstash Redis** or Redis Enterprise.

Step-by-step guides, domain configuration, and rollback strategies are detailed in the [Deployment Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/DeploymentGuide.md).

---

## 🤝 Core Integrations

### AI Pipeline
```mermaid
graph TD
  Q[User Query] --> Intent[Intent Classification Engine]
  Intent --> Search[RAG: ChromaDB Context Retrieval]
  Search --> Prompt[PromptEngine: Versioned Template compiler]
  Prompt --> LLM[BaseLLMProvider: Model Inference]
  LLM --> Validate[Validator: Check schemas conventions]
  Validate --> Stream[SSE: Stream blocks to Client Workspace]
```

### DataHub Integration
MetaPilot queries LinkedIn DataHub via its GraphQL GMS API endpoints. If GMS is unreachable, the system automatically redirects metadata queries to a fallback catalog loaded locally:
* **Upstream/Downstream lineage traversal**: Maps relationships across platforms (e.g. Snowflake -> Postgres).
* **Owner mapping**: Attributes technical POCs (`owner_urn`) to datasets.
* **Tag glossary checks**: Automatically resolves flags (e.g. `PII`, `Financials`).

### MCP Integration
MetaPilot integrates a **Model Context Protocol (MCP)** server adapter (`DataHubMCPServerAdapter`). This adapter exposes two core tooling commands:
1. `get_schema_fields(urn)`: Fetches data attributes of a specific catalog table.
2. `get_lineage_relations(urn)`: Programmatically lists dependency coordinates paths.

---

## 👩‍⚖️ Judge Mode & Explainability

For hackathon evaluations, judges can activate **Judge Mode** in **Settings > Experimental Beta**:

1. **Auto Observability**: When enabled, the **Explainability Panel** in the AI Workspace is forced to expand.
2. **Telemetry Telemetry**: Shows latency scores (embeddings, RAG lookup, model inference, validation).
3. **Prompt Inspect**: Inspects the exact compiled template and inputs sent to Gemini.
4. **JSON Telemetry Download**: Export complete reasoning logs via a single-button click.

---

## 🔌 API Overview

Below are the primary backend REST endpoints:

### AI & Chat
* `POST /api/ai/chat`: Submits query runs, returning character-by-character SSE event streams.
* `GET /api/ai/sessions`: Fetches history index records.
* `DELETE /api/ai/chat/{session_id}`: Clears individual conversation histories.

### Automation & Lines
* `POST /api/automation/generate`: Generates SQL, dbt, or Airflow DAG configurations.
* `GET /api/automation/export`: Returns a zip payload of generated data assets.
* `POST /api/vector/reindex`: Triggers vector DB reindexing.

---

## 🗺️ Roadmap
- [x] **Phase 1**: Base FastAPI server, SQLite fallbacks, and React landing layouts.
- [x] **Phase 2**: Multi-stage RAG, persistent ChromaDB indexing, and Gemini integration.
- [x] **Phase 3**: Code generators (SQL, dbt, Airflow), explainability telemetry panels, and split-pane workspace.
- [x] **Phase 4**: DataHub GraphQL client hooks, MCP server adapter, and persistent local storage Judge Mode configuration.
- [ ] **Phase 5**: Real-time DataHub GMS metadata write-back actions.
- [ ] **Phase 6**: Slack/Teams notification webhooks for downstream schema changes.

---

## 📄 License

MetaPilot is licensed under the Apache License, Version 2.0. See the [LICENSE](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/LICENSE) file for the full license text.

---

## 👥 Contributors & Acknowledgements

* **Lead AI Engineer & DevOps**: Antigravity
* **Product & UX Design**: DeepMind Team
* **DataHub Team**: Thank you for the robust open-source metadata platform.
* **Anthropic MCP Team**: For defining the Model Context Protocol.
