# MetaPilot Hackathon Pitch Deck & Demo Manual

This document details narration scripts and answers to FAQs to prepare the team for hackathon submissions.

---

## 1. Narration Flow (3-Minute Script)

- **[0:00 - 0:30] — Hook & The Problem**:
  > "Modern data ecosystems are highly complex. Data engineers spend hours hunting down lineage paths, writing boilerplate Airflow scripts, and diagnosing schema errors. DataHub provides metadata catalogs, but it lacks intelligence."
- **[0:30 - 1:30] — The Workspace Demo**:
  > "Enter MetaPilot. Here is our live chat workspace. Let's submit a query: 'Generate SQL to join users and orders.'
  > Notice the split screen. On the left, MetaPilot analyzes constraints. On the right, the **Tabbed Artifact Editor** renders a primary-key join query matching the DataHub Snowflake schema. Copy, download, or compile it with a single click."
- **[1:30 - 2:30] — Judge Mode & Explainability**:
  > "Let's toggle **Judge Mode** inside settings. Back in the workspace, the right panel automatically expands. 
  > Judges can trace intent classes, latency breakdowns, and RAG context chunks. There are no hallucinations here; every response is grounded in metadata."
- **[2:30 - 3:00] — Closing Pitch**:
  > "MetaPilot isn't a prototype. It is a production-ready AI companion built for enterprise-grade data platforms. Thank you!"

---

## 2. Elevator Pitches

### 30-Second Pitch
> "MetaPilot is an autonomous AI Engineering Agent that navigates metadata catalogs using DataHub, compiling production-ready SQL models, dbt schemas, and Airflow DAGs with zero hallucinations. It is a smart copilot for data engineering."

### 60-Second Pitch
> "Data teams spend too much time diagnosing pipeline errors and writing boilerplate scripts. MetaPilot integrates DataHub, SQLite, and ChromaDB to understand schemas and lineage structures. By grounding reasoning prompts in actual metadata, it allows engineers to generate SQL joins, build Airflow DAGs, trace upstream change impacts, and audit schemas. Every output is validated, and live metrics are displayed in a premium explainability panel."

---

## 3. Frequently Asked Questions (FAQs)

- **Q: How does MetaPilot ensure generated code does not hallucinate?**
  - **A**: MetaPilot retrieves schema configurations from DataHub and injects them as prompt constraints. Additionally, all outputs undergo format checking against active catalog properties before rendering.
- **Q: How does the local fallback operate?**
  - **A**: If ChromaDB or PyTorch packages are missing or fail import checks on the host server, the system redirects indexers and searches to the local SQLite database.
