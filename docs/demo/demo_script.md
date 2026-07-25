# MetaPilot Demo Package & Speaking Scripts

This document houses the pitching assets, video scripts, UI flows, and FAQs for the MetaPilot platform.

---

## 📖 Table of Contents
1. [Elevator Pitches](#1-elevator-pitches)
2. [UI Demo Flow (Timeline)](#2-ui-demo-flow-timeline)
3. [3-Minute Video Speaking Script](#3-3-minute-video-speaking-script)
4. [Judge Walkthrough Guide](#4-judge-walkthrough-guide)
5. [Frequently Asked Questions (FAQs)](#5-frequently-asked-questions-faqs)

---

## 1. Elevator Pitches

### 30-Second Elevator Pitch
> "MetaPilot is an autonomous AI Engineering Agent that navigates metadata catalogs using DataHub, compiling production-ready SQL models, dbt transformation configurations, and Airflow orchestrations with zero hallucinations. By embedding semantic searches in ChromaDB and enforcing schema validations, it helps data engineering teams build, analyze, and diagnose pipelines in a premium, high-observability split-screen workspace."

### 60-Second Elevator Pitch
> "Modern data teams waste hours hunting down table lineages, manually writing repetitive dbt and Airflow boilerplate, and fixing compile errors caused by mismatched schemas. 
> MetaPilot solves this by connecting directly to LinkedIn DataHub. It vectorizes your catalog into ChromaDB and uses LLM agents to translate natural language prompts into production-grade data assets. In our dual-pane workspace, engineers can generate SQL joins, build Airflow TaskFlow code, and review downstream impact. Best of all, every output is run through semantic validators to guarantee zero hallucinations, and all telemetry is exposed in an interactive explainability sidebar. MetaPilot is a smart copilot for enterprise data platforms."

### 2-Minute Technical Pitch
> "Data catalogs like DataHub are excellent search indexes, but they are completely passive. MetaPilot turns metadata into an active engineering partner. 
> Architecturally, we use FastAPI to expose robust REST routes and SSE streams. Our retrieval engine utilizes SentenceTransformers to embed catalog schemas. At query time, we execute multi-stage RAG, combining semantic scores, metadata platform filters, and keyword boosts. If ChromaDB is unavailable, the application gracefully routes queries to a local SQLite database using Python-calculated cosine similarities.
> Once retrieved, context is injected into our Prompt Engine and dispatched to Google Gemini. The streamed response is parsed for code blocks and verified against active schemas to prevent hallucinated columns. For auditability, our Workspace contains a dual-pane editor next to an Explainability Panel that details token usage, prompt templates, and execution latencies. We also integrate an MCP server adapter so external AI agents can leverage our schema discovery tools. MetaPilot is built for security, resilience, and speed."

---

## 2. UI Demo Flow (Timeline)

* **[0:00 - 0:20] Landing & Login**: Show the modern dark-themed landing page, review the features, and log in with default credentials.
* **[0:20 - 0:50] Explorer & Lineage**: Navigate the Metadata Explorer to view snowflake tables (`users_dim`, `orders_fact`). Click on the Lineage Viewer to show visual relationship trees.
* **[0:50 - 1:40] AI Workspace (SQL & dbt)**: Go to the Workspace. Ask: *"Generate a join query for Snowflake users and orders."* Watch the code stream into the editor and inspect the generated SQL and dbt configuration files.
* **[1:40 - 2:20] Airflow Generation & ZIP Export**: Ask: *"Create a python Airflow DAG to run this daily."* Verify the TaskFlow code. Click **Download ZIP** to package all files.
* **[2:20 - 2:50] Judge Mode & Telemetry**: Toggle **Judge Mode** in Settings. Return to the Workspace to reveal the expanded RAG telemetry panel showing token counts and retrieval metrics.
* **[2:50 - 3:00] Conclusion**: Highlight the developer docs and close the video.

---

## 3. 3-Minute Video Speaking Script

### **[0:00 - 0:30] Introduction & Problem Hook**
* **Visual**: Present the landing page. Move cursor over cards.
* **Audio (Voiceover)**: 
  > "Every day, data engineering teams lose hours tracing downstream tables, writing boilerplate SQL transforms, and hunting compile failures caused by mismatched column names. 
  > Metadata catalogs like DataHub log these assets, but they lack active intelligence. 
  > Introducing MetaPilot: the autonomous AI engineering companion that navigates metadata catalogs to build and analyze pipelines with zero hallucinations."

### **[0:30 - 1:15] Core Workspace & Code Generation**
* **Visual**: Click "Get Started", enter credentials, and land on the Workspace page. Type the Snowflake query.
* **Audio (Voiceover)**: 
  > "Let’s log into the platform. We are greeted by a modern, high-fidelity dashboard. Let’s enter the AI Workspace. 
  > On the left is our reasoning assistant; on the right is our split-pane code editor. I’ll prompt MetaPilot to 'join raw stripe events with production order facts.' 
  > Notice the speed: MetaPilot streams the code chunk-by-chunk. Because our RAG pipeline retrieves the exact Snowflake schema definitions, the generated query uses correct columns and types. No hallucinations.
  > Under the code tabs, you can see that the agent didn't just build the SQL — it also compiled the dbt configuration and schema tests automatically."

### **[1:15 - 2:15] Lineage Impacts & Exporters**
* **Visual**: Click the "Explorer" tab, select a dataset, then click "Lineage". Prompt: *"What is the impact of removing the currency column from orders_fact?"*
* **Audio (Voiceover)**: 
  > "Next, let’s explore our lineage impact viewer. We can select any catalog dataset to see upstream and downstream relationships. 
  > When I ask MetaPilot to assess the impact of deleting a column, it traverses the lineage tree, evaluates dependencies, and outputs a structured risk assessment.
  > If we're satisfied with the generated assets, we can bundle the SQL, dbt configurations, and Python Airflow DAG orchestration script into a single ZIP archive with one click. Our pipeline is ready for deployment."

### **[2:15 - 3:00] Judge Mode & Explainability**
* **Visual**: Navigate to Settings, click the "Experimental Beta" tab, and toggle "Hackathon Judge Mode". Return to the Workspace.
* **Audio (Voiceover)**: 
  > "For hackathon evaluations, we’ve built a persistent Hackathon Judge Mode. 
  > Enabling this in Settings automatically expands our Workspace Observability sidebar. 
  > Reviewers can audit input/output token counts, inspect system prompt templates, trace RAG vector search results, and view latency metrics for each step.
  > MetaPilot is a fully functional, production-ready companion for modern data teams. 
  > Navigate data. Build smarter. Thank you!"

---

## 4. Judge Walkthrough Guide

Refer to [docs/demo/judge_experience.md](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/demo/judge_experience.md) for full commands, prompts, and expected results.

---

## 5. Frequently Asked Questions (FAQs)

#### 1. How does MetaPilot prevent hallucinations in generated SQL?
MetaPilot retrieves schema schemas from DataHub (or the vector database fallback) and injects them as strict instructions into the system prompt. Additionally, a validation parser matches output columns against known attributes before rendering.

#### 2. What happens if LinkedIn DataHub is offline?
MetaPilot is built to be resilient. If the GraphQL GMS server is unreachable, it redirects queries to a seeded fallback database carrying offline models (`users_dim`, `orders_fact`, `stripe_webhook_events`).

#### 3. How does the vector search fallback operate?
If the system cannot load local ChromaDB C++ bindings (common on Windows environments), it switches to a local SQLite database and calculates cosine similarities in Python.

#### 4. Can MetaPilot write back tags and documentation to DataHub?
In the current v1.0.0 release, metadata access is read-only. Live metadata write-backs are scheduled for v1.1.0 (Phase 5).

#### 5. Is there support for databases other than Snowflake?
Yes, MetaPilot supports schema retrieval for any platform supported by DataHub, including Postgres, MySQL, BigQuery, Redshift, and Databricks.

#### 6. How is user authentication managed?
User accounts are saved in PostgreSQL (or SQLite). Passwords are encrypted with bcrypt, and sessions use HMAC-SHA256 signed JWT tokens.

#### 7. Can we export the generated files to a local environment?
Yes, the Workspace page includes a "Download ZIP" action that packages the generated SQL, dbt configurations, and Airflow DAGs.

#### 8. Does MetaPilot support Model Context Protocol (MCP)?
Yes, it includes a built-in MCP server adapter. This allows external tools to invoke `get_schema_fields` and `get_lineage_relations` commands.

#### 9. How do we test the telemetry outputs?
Enable **Hackathon Judge Mode** in the settings page. This forces the Workspace to show RAG contexts, prompt versions, and latencies.

#### 10. Can I run MetaPilot inside Docker?
Yes, a `docker-compose.yml` file is provided to start PostgreSQL and Redis containers for local testing.
