# MetaPilot Devpost Submission Package

This document contains ready-to-copy submission materials for the Devpost hackathon profile page.

---

## 📋 Basic Information

### Project Name
`MetaPilot`

### One-line Tagline
`Navigate Data. Build Smarter.`

### Short Description (50 words)
`MetaPilot is an enterprise-grade AI Engineering Agent built on DataHub. It retrieves schema, lineage, and ownership data to help engineers generate production-ready SQL, dbt configurations, and Airflow DAGs with zero hallucinations, displaying real-time explainability telemetry and offering resilient local SQLite and Model Context Protocol (MCP) server fallbacks.`

### Medium Description (200 words)
`Data engineering teams spend massive hours hunting down table lineages, manually writing repetitive dbt and Airflow boilerplate, and debugging pipeline compile errors caused by mismatched schema definitions. While metadata platforms like LinkedIn DataHub index catalog assets, they remain passive, lacking execution logic. 

MetaPilot bridges this gap by acting as an active AI data engineering companion. By indexing catalog properties in ChromaDB, the agent parses schemas, traverses lineages, compiles queries, and validates output code files. 

In our premium split-screen workspace, engineers prompt the agent on the left and inspect generated assets in the editor on the right. Toggling Judge Mode force-expands our Explainability panel, exposing token usage and latency breakdowns. 

To ensure maximum availability, the platform runs a dual-engine search pipeline that falls back to a local SQLite database with Python-calculated cosine similarities if ChromaDB is unavailable. It also includes an MCP server adapter so external agents can utilize our catalog discovery actions. MetaPilot turns metadata into an active engineering partner.`

---

## 📖 Long Description (1000+ words)

### 1. Problem Statement
Data platform ecosystems are expanding exponentially. A typical enterprise infrastructure manages thousands of tables in Snowflake or BigQuery, hundreds of raw Postgres sources, and a complex web of Airflow DAGs and dbt transforms. In this environment, data engineering teams face three core pain points:
1. **Inefficient Lineage Tracing**: Changing an upstream database column requires manual impact audits to verify what downstream Looker dashboards or dbt tables will break.
2. **Boilerplate Overload**: Engineers write repetitive SQL join queries, dbt schema config configurations, and Airflow TaskFlow code files manually.
3. **Hallucinatory AI Tools**: Generic coding models lack context. Without actual metadata catalog grounding, they generate code referencing nonexistent tables or columns, leading to pipeline failures.

Metadata catalogs like LinkedIn DataHub resolve the indexing problem, but they are completely passive registries. They log schemas but cannot generate code or automate workflows.

---

### 2. The Solution: MetaPilot
MetaPilot turns metadata into an active engineering partner. It integrates directly with DataHub, vectorizes the catalog, and grounds LLM agents in verified database schemas and lineage definitions. 

By coupling context retrieval with an output validation layer, MetaPilot guarantees that generated code matches actual table schemas. 

```
                                  ┌────────────────────────┐
                                  │   User Query Request   │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │  DataHub GMS Metadata  │
                                  │  (Schemas & Lineages)  │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ ChromaDB Vector Search │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Prompt Context Ground  │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Google Gemini Inference│
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                  ┌────────────────────────┐
                                  │ Output Schema Check    │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
            ┌───────────────────────┐                   ┌───────────────────────┐
            │   Stream SSE to UI    │                   │ Export ZIP Container  │
            │   (Reasoning + Code)  │                   │ (SQL, dbt, Airflow)   │
            └───────────────────────┘                   └───────────────────────┘
```

---

### 3. Key Features

#### A. Smart Code Automation Generators
MetaPilot translates natural language instructions into functional data assets:
- **SQL Join Builder**: Generates SELECT queries matching schemas, including primary/foreign key joins.
- **dbt Config Compiler**: Synthesizes `schema.yml` configuration structures and schema testing specifications.
- **Airflow DAG Generator**: Standardizes Python pipelines using TaskFlow decorators (`@dag`, `@task`).

#### B. Resilient Dual-Engine Retrieval
To resolve compilation issues in local environments (e.g. C++ bindings missing for ChromaDB on Windows hosts), MetaPilot uses a fallback search strategy:
- **ChromaDB (Primary)**: Standard collection search using SentenceTransformers (`all-MiniLM-L6-v2`) embeddings.
- **SQLite (Fallback)**: Seamless redirection to a local SQLite database calculating cosine similarities.

#### C. Model Context Protocol (MCP) Adapter
Exposes metadata tools through standard Model Context Protocol endpoints, allowing other AI services on the network to query schema fields and lineages as decoupled tools.

#### D. Diagnostics & Explainability Panel
Activating **Hackathon Judge Mode** in settings force-expands our Workspace Observability sidebar. Judges can review token counters, inspect the system prompts, review validation checks, and download complete JSON telemetry logs.

---

### 4. Technology Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (harmonious HSL color variables, modern glassmorphic theme), Framer Motion (micro-animations), Lucide Icons.
* **Backend**: FastAPI (Python 3.12+), Uvicorn.
* **Database & Caching**: PostgreSQL (user & session state), Redis (rate limiting & cache).
* **Vector Store**: ChromaDB (primary vector) + SQLite (retrieval fallback).
* **Embeddings & LLM**: SentenceTransformers (`all-MiniLM-L6-v2`), Google Gemini API (primary API), Groq & OpenAI (API fallbacks).

---

### 5. Challenges Faced
* **Vector Store Portability**: ChromaDB packages require native C-compilers that are often difficult to install on Windows development environments. We resolved this by building a custom Python-calculated cosine similarity retriever on top of SQLite, ensuring zero installation friction.
* **Streaming Telemetry**: Streaming character-by-character responses via Server-Sent Events (SSE) while simultaneously calculating post-processing latencies and validation checks was challenging. We resolved this by appending structured telemetry JSON objects at the end of the SSE message queue.

---

### 6. Accomplishments
* Developed a high-fidelity, responsive React workspace featuring a tabbed editor pane, code highlighting, and collapsible telemetry sidebars.
* Engineered a robust fallback data catalog wrapper that simulates Snowflake and Postgres metadata locally when the LinkedIn DataHub API is offline.
* Unified metadata exploration and code automation into a single workflow.

---

### 7. Lessons Learned
* **Grounding reduces hallucination**: Grounding prompts in database schemas reduces LLM coding hallucinations to near-zero.
* **Design is a core feature**: Modern design layouts, clean typography, HSL-harmonized colors, and micro-animations significantly improve the developer experience.

---

### 8. Why DataHub, MCP, and AI?

#### Why LinkedIn DataHub?
DataHub is the industry-standard metadata platform. Grounding MetaPilot in DataHub ensures compatibility with enterprise data catalogs out of the box.

#### Why Model Context Protocol (MCP)?
MCP is an open standard. Integrating an MCP server adapter ensures that MetaPilot's metadata discovery tools can be used by other AI agents.

#### Why AI?
Traditional parsing tools fail when processing natural language prompts (e.g. *"Join users and orders and make it run daily"*). LLM agents excel at translating intent into code, while our metadata grounding ensures the code is accurate.

---

### 9. Future Scope
* **Phase 5 (v1.1.0)**: Real-time metadata write-backs to DataHub (updating tags and ownership configurations).
* **Phase 6 (v1.2.0)**: Direct Slack/Teams alert notifications for downstream impact analysis.
