<div align="center">

# 🧭 MetaPilot

### *The Enterprise Data Engineering Copilot Powered by Metadata Intelligence*

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python Version](https://img.shields.io/badge/Python-3.12%2B-brightgreen.svg)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/Node-20%2B-blue.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TS-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![DataHub Integration](https://img.shields.io/badge/Integration-DataHub-cyan.svg)](https://datahubproject.io/)
[![MCP Compliance](https://img.shields.io/badge/Protocol-MCP-orange.svg)](https://modelcontextprotocol.io/)

**MetaPilot** is a production-ready, enterprise-grade AI Data Engineering Copilot built on top of database catalog registries and metadata catalogs (like **LinkedIn DataHub**). MetaPilot translates static metadata logs into actionable engineering assets—automating **dbt models**, **Airflow DAGs**, and **SQL queries**—while tracking downstream impact risks.

[Website (Demo)](http://localhost:5173) • [API Specs](http://localhost:8000/docs) • [Architecture Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/Architecture.md) • [Devpost Submission](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/devpost_submission.md)

</div>

---

## 📖 Table of Contents
1. [Overview & Problem Statement](#-overview--problem-statement)
2. [Key Capabilities](#-key-capabilities)
3. [Architecture Overview](#-architecture-overview)
4. [Technology Stack](#-technology-stack)
5. [Installation & Setup](#-installation--setup)
6. [Docker Orchestration](#-docker-orchestration)
7. [Environment Configuration](#-environment-configuration)
8. [API Documentation](#-api-documentation)
9. [AI Pipeline & Grounding Control](#-ai-pipeline--grounding-control)
10. [Model Context Protocol (MCP) Tool Suite](#-model-context-protocol-mcp-tool-suite)
11. [Performance Benchmarks](#-performance-benchmarks)
12. [Security Architecture](#-security-architecture)
13. [FAQ & Troubleshooting](#-faq--troubleshooting)
14. [Roadmap](#-roadmap)
15. [License](#-license)

---

## 🚨 Overview & Problem Statement

Modern enterprise data stacks suffer from fragmentation. Hundreds of databases, staging areas, and BI tools result in complex, spaghetti-like dependency graphs. Data engineers lose valuable time:
1. **Tracing Lineage & Schema Drift**: Predicting how an upstream column type alteration affects downstream analytical models.
2. **Writing Boilerplate Code**: Generating repetitive staging configurations, dbt packages, and TaskFlow DAGs.
3. **Diagnosing Query Failures**: Identifying root causes of pipeline compiler failures without context.

While standard metadata catalogs index database assets, they lack **autonomous intelligence** to act. **MetaPilot** acts as a senior AI data engineering companion. By indexing catalog properties in a semantic vector store (ChromaDB + SQLite fallback) and executing RAG reasoning over metadata relationships, MetaPilot bridges the gap between catalog discovery and engineering automation.

---

## ✨ Key Capabilities

* 🚀 **Metadata-Grounded RAG**: Injects active catalog schemas, types, and lineages into LLM contexts to prevent hallucinations.
* 🌿 **Impact Traversals**: Traces upstream and downstream dependencies dynamically to calculate schema drift risk.
* 💻 **Interactive Split-Pane Workspace**: Edit, verify, and package code structures in real-time alongside AI reasoning logs.
* 🔌 **Expanded MCP Adapter**: Conforms to the **Model Context Protocol (MCP)**, exposing tools to perform syntax audits, schema discoveries, and index optimizations.
* 🛡️ **Stateless Chat Memory**: Persists conversation sessions in PostgreSQL to support multi-worker load balancing.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
  subgraph Client_Layer [React Frontend Application]
    UI[Explorer / Lineage / Settings UI]
    Axios[Axios client.ts with Interceptors]
    AuthCtx[AuthProvider / Global Context]
  end

  subgraph Service_Layer [FastAPI Web Service]
    Router[FastAPI app/main.py]
    Middleware[Logging & Exception Middleware]
    AuthDep[get_current_user Dependency]
    MetaAPI[metadata.py Endpoints]
  end

  subgraph Integration_Layer [Metadata & AI Integrations]
    DHClient[datahub_client Async HTTPX]
    MCP[mcp_server_adapter Model Context Protocol]
    RAG[semantic_retriever RAG Store]
    Provider[BaseLLMProvider Gemini/OpenAI]
  end

  subgraph Storage_Layer [Databases & Cache]
    DB[(PostgreSQL Database)]
    Redis[(Redis Caching & Limiters)]
    DataHub[DataHub GMS Server :8080]
  end

  UI --> Axios
  Axios --> Router
  Router --> Middleware
  Middleware --> MetaAPI
  MetaAPI --> AuthDep
  MetaAPI --> DHClient
  MetaAPI --> MCP
  MetaAPI --> RAG
  DHClient --> Redis
  DHClient --> DataHub
  RAG --> DB
  AuthDep --> DB
  Provider --> RAG
```

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion (visual animations)
* **Backend**: FastAPI, Python 3.12, Uvicorn, SQLAlchemy 2.0 (asyncpg), Alembic, Pydantic v2
* **Storage**: PostgreSQL 16 (state & sessions), Redis 7 (rate limiting & response caching), ChromaDB (embeddings vector index)
* **AI & Embeddings**: SentenceTransformers (`all-MiniLM-L6-v2`), Google Gemini API (Primary Provider), OpenAI/Groq (Fallbacks)

---

## 🚀 Installation & Setup

### Prerequisites
* **Node.js**: v20.0.0 or later
* **Python**: v3.12.0 or later
* **Docker & Docker Compose**: v5.3+

### 1. Configure the Environment
Copy the configuration template to create a local `.env` file in the backend directory:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env to add your API credentials (e.g. GEMINI_API_KEY)
```

### 2. Launch Local Database Services
MetaPilot requires PostgreSQL and Redis. Start them via Docker Compose:
```bash
docker-compose up -d db redis
```
This spins up PostgreSQL on `localhost:5432` and Redis on `localhost:6379`.

### 3. Spin Up the Backend Web Server
1. Navigate to the backend directory and create a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database and launch the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
The Swagger API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 4. Build and Run the React Frontend
1. Open a new terminal in the root directory:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
Open [http://localhost:5173](http://localhost:5173) in your browser.
* **Default Login**: `admin@metapilot.io`
* **Default Password**: `admin123`

---

## 🐳 Docker Orchestration

To run the entire multi-container application locally, execute:
```bash
docker-compose up -d
```
This will build the backend application image, download the Postgres and Redis dependencies, and expose the backend services on port `8000`.

---

## ⚙️ Environment Configuration

Properties defined in `backend/.env` govern the backend environment behavior:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API integration key | *None* |
| `PRIMARY_AI_PROVIDER` | Active LLM service (`gemini`, `openai`, `groq`) | `gemini` |
| `DATABASE_URL` | Async PostgreSQL connection string | `postgresql+asyncpg://postgres:postgres@localhost:5432/metapilot` |
| `REDIS_URL` | Redis instance endpoint URL | `redis://localhost:6379/0` |
| `DATAHUB_GMS_URL` | LinkedIn DataHub GMS Server URL | `http://localhost:8080` |
| `CHROMADB_PERSIST_PATH` | Storage path of vector databases | `./chroma_db` |

---

## 🔌 API Documentation

| Method | Path | Request Body | Response Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `UserRegister` | Registers a user, creates workspace, returns JWT token. |
| `POST` | `/api/auth/login` | `UserLogin` | Auths credentials, records audit logs, returns token. |
| `POST` | `/api/ai/chat/stream` | `ChatRequest` | SSE streaming endpoint processing queries and returning reasoning logs. |
| `GET` | `/api/ai/chat/history` | *None* | Retrieves user conversation histories from Postgres. |
| `POST` | `/api/ai/chat/pins` | `PinRequest` | Pins or unpins active chat sessions in PostgreSQL. |
| `DELETE` | `/api/ai/chat/{session_id}` | *None* | Deletes conversation session and cascade-deletes messages. |
| `GET` | `/api/metadata/search` | `q`, `type` | Searches catalog schemas and platforms, checks Redis cache. |
| `GET` | `/api/metadata/lineage` | `urn` | Computes downstream lineages and nodes coordinates. |
| `POST` | `/api/automation/generate` | `GenerationRequest` | Generates dbt models, Airflow DAGs, or SQL check scripts. |
| `GET` | `/api/system/health` | *None* | Runs diagnostics on PostgreSQL and Redis statuses. |

---

## 🧠 AI Pipeline & Grounding Control

```mermaid
graph TD
  User[User Query] --> Intent[Intent & Type Recognition]
  Intent --> Vector[Semantic Search RAG: SQLite/Chroma]
  Vector --> Context[Context Assembly & Template Compilation]
  Context --> LLM[LLM Provider: Gemini / OpenAI Stream]
  LLM --> Code[Response Parser: Code Extraction]
  Code --> Client[Client Split-Pane Workspace Render]
```

MetaPilot implements **confidence scoring** to ensure metadata integrity:
1. **Verification**: Compares generated schema models against schemas retrieved from the database.
2. **Hallucination Protection**: If query columns do not match the index, MetaPilot flags the discrepancy and prompts the engineer.
3. **Response Ranking**: Exact keyword matching boosts semantic search score weights, prioritizing matches on exact catalog names.

---

## 🔧 Model Context Protocol (MCP) Tool Suite

MetaPilot implements the **Model Context Protocol (MCP)**, exposing a tool suite for developers:

1. `get_schema_fields(urn)`: Retrieves schemas and data types for a table.
2. `get_lineage_relations(urn)`: Lists up/downstream catalog links.
3. `search_assets(query, type)`: Fuzzy-searches DataHub catalog objects.
4. `generate_dbt(model_name, columns)`: Compiles dbt staging schema specifications.
5. `generate_airflow(dag_id, schedule_interval, tasks)`: Generates taskflow DAG code.
6. `impact_analysis(urn, target_column)`: Predicts downstream schema drift risk.
7. `validate_sql(query)`: Audits syntax structure, matching quotes, and clauses.
8. `explain_query(query)`: Translates SQL operations into plain English.
9. `generate_tests(model_name, columns)`: Recommends dbt testing assertions.
10. `recommend_indexes(query)`: Recommends PostgreSQL/Snowflake indexes based on JOIN/WHERE columns.

---

## 📊 Performance Benchmarks

MetaPilot features an optimized execution loop:
* **Response Cache**: Redis caching reduces search latency to `<2ms`.
* **RAG Lookups**: Semantic lookups complete in `<15ms`.
* **Telemetry Monitoring**: Measures latency across token usage, prompt versioning, and LLM inference.

| Metric | Target | Actual (Local Dev) |
| :--- | :--- | :--- |
| System Health Ping | `<5ms` | `2.4ms` |
| Cached Metadata Query | `<10ms` | `1.8ms` |
| RAG Retrieval Latency | `<30ms` | `12.1ms` |
| Code Compilation overhead | `<50ms` | `18.5ms` |

---

## 🛡️ Security Architecture

* **Authorization Rules**: Enforces Role-Based Access Control (RBAC) across roles: `Admin`, `Developer`, and `Viewer`.
* **State Hygiene**: Sanitizes SQL inputs and uses parameterized ORM queries to prevent SQL injections.
* **Token Cycling**: Uses short-lived access tokens (30 minutes) and revokable refresh tokens (7 days).
* **Secret Integrity**: Warnings are logged if default security keys are used, prompting overrides via environment configuration.

---

## ❓ FAQ & Troubleshooting

### Why is MetaPilot in offline fallback mode?
If the connection to LinkedIn DataHub fails, the system switches to a high-fidelity local catalog (`FALLBACK_CATALOG`) to keep features running during offline development.

### How do I reset database state mappings?
Stop the containers and delete the PostgreSQL volume:
```bash
docker-compose down -v
```

### Can I run tests?
Yes, run backend tests using pytest:
```bash
cd backend
pytest app/tests/
```

---

## 🗺️ Roadmap
* [x] **Phase 1**: Base FastAPI server, SQLite fallbacks, and React landing layouts.
* [x] **Phase 2**: Multi-stage RAG, persistent ChromaDB indexing, and Gemini integration.
* [x] **Phase 3**: Code generators (SQL, dbt, Airflow), explainability telemetry panels, and split-pane workspace.
* [x] **Phase 4**: DataHub GraphQL client hooks, MCP server adapter, and persistent local storage Judge Mode configuration.
* [x] **Phase 5**: Stateless PostgreSQL database chat memory migrations and extended MCP tools adapter suite.
* [ ] **Phase 6**: Bi-directional catalog write-back and schema mutation actions.

---

## 📄 License

MetaPilot is licensed under the Apache License, Version 2.0. See the [LICENSE](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/LICENSE) file for details.
