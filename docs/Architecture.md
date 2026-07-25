# MetaPilot Technical Architecture Specification

This document provides a deep-dive specification of the MetaPilot technical architecture. It covers the overall system design, component-level layouts, data storage schemas, pipelines, authentication protocols, and request lifecycles.

---

## Table of Contents
1. [Overall System Architecture](#1-overall-system-architecture)
2. [Frontend Client Architecture](#2-frontend-client-architecture)
3. [Backend Service Architecture](#3-backend-service-architecture)
4. [AI Agent Pipeline](#4-ai-agent-pipeline)
5. [RAG Pipeline Architecture](#5-rag-pipeline-architecture)
6. [DataHub Integration Topology](#6-datahub-integration-topology)
7. [Authentication Protocol Flow](#7-authentication-protocol-flow)
8. [Database ER Schema](#8-database-er-schema)
9. [HTTP Request/Response Lifecycle](#9-http-requestresponse-lifecycle)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. Overall System Architecture

The overall system architecture demonstrates how the React user interface, FastAPI backend, core caching structures, metadata catalog registries, and LLM APIs interact.

```mermaid
graph TD
    subgraph Client ["Client Layer (Web Web App)"]
        UI["Vite + React Client Application"]
    end

    subgraph API ["Application Server (FastAPI)"]
        Server["Core FastAPI Application Service"]
        Limiter["Rate Limiting Middleware"]
        AuthSrv["Auth Manager"]
        RAG["RAG Coordinator"]
        Automate["Automation Engine"]
        MCP["MCP Server Adapter"]
    end

    subgraph Storage ["Persistence & Caching"]
        Postgres[("PostgreSQL Database\n(User, Workspace State)")]
        Redis[("Redis Cache\n(Session, Limiting, Caches)")]
        Chroma[("ChromaDB Vector Store\n(Metadata Embeddings)")]
        SQLite[("SQLite Fallback DB\n(Fallback Store)")]
    end

    subgraph External ["External Services"]
        DataHub["LinkedIn DataHub GMS\n(Metadata & Lineage)"]
        Gemini["Google Gemini API\n(Primary LLM)"]
        Groq["Groq API\n(LLM Fallback)"]
        OpenAI["OpenAI API\n(Embedding/LLM)"]
    end

    %% Interactions
    UI <-->|HTTPS API / SSE streams| Server
    Server <--> Limiter
    Server <--> AuthSrv
    Server <--> RAG
    Server <--> Automate
    Server <--> MCP

    AuthSrv <-->|Reads/Writes| Postgres
    Limiter <-->|Read rate tokens| Redis
    RAG <-->|Fetch context| Chroma
    RAG <-->|Fallback context| SQLite
    MCP <-->|Live Schema/Lineage| DataHub
    Server <-->|Live API Client| DataHub

    RAG -->|Inference stream| Gemini
    RAG -->|Inference fallback| Groq
    RAG -->|Embedding services| OpenAI
```

---

## 2. Frontend Client Architecture

The React frontend utilizes a modular structure consisting of routers, page containers, reusable components, context providers, and customized api wrapper modules.

```mermaid
graph TD
    subgraph Router ["React Router Page Container Routes"]
        Land["Landing Page"]
        Login["Login Page"]
        Reg["Register Page"]
        Dash["Dashboard Page"]
        Work["AI Workspace Page"]
        Exp["Metadata Explorer Page"]
        Line["Lineage Impact Page"]
        Anal["Analytics telemetry Page"]
        Set["Settings Page"]
    end

    subgraph State ["Context State Providers"]
        AuthCtx["AuthContext\n(User JWT token)"]
        ThemeCtx["ThemeContext\n(Dark/Glass theme)"]
        ConfigCtx["ConfigContext\n(Judge Mode toggle)"]
    end

    subgraph APIClient ["API Client Services"]
        Axios["Axios Base Manager\n(REST calls)"]
        SSEListener["SSE Stream Listener\n(Character streaming)"]
    end

    subgraph UIComponents ["Reusable UI Components"]
        Editor["Tabbed Code Editor\n(SQL, dbt, DAGs)"]
        TelePanel["Explainability Panel\n(RAG Logs, Latency)"]
        LineageGraph["Lineage Tree Diagram\n(Interactive canvas)"]
        MetricGrid["Telemetry Grid\n(Charts & Stats)"]
    end

    %% Wiring
    Router --> State
    Router --> UIComponents
    UIComponents --> APIClient
```

---

## 3. Backend Service Architecture

The backend consists of FastAPI endpoints protected by authorization dependencies, processing logic in core modules, and integration with the vector indexer and schema clients.

```mermaid
graph TD
    subgraph RouterLayer ["API Router Layer (App Route Controllers)"]
        AuthRouter["/api/auth"]
        ChatRouter["/api/ai/chat"]
        SessionRouter["/api/ai/sessions"]
        AutoRouter["/api/automation"]
        VectorRouter["/api/vector"]
    end

    subgraph Security ["Security & Dependencies Layer"]
        JWT["JWTBearer\n(Token Authenticator)"]
        GetDB["get_db\n(PostgreSQL async session)"]
    end

    subgraph LogicLayer ["Core Logic Processors"]
        Orchestration["Agent Orchestrator"]
        GenEngine["SQL/dbt/Airflow Code Generators"]
        Retriever["Semantic Context Retriever"]
        VectorService["Vector Sync Manager"]
    end

    subgraph AdapterLayer ["Integration & Adapter Layers"]
        GMSClient["DataHubAsyncClient"]
        MCPSrv["DataHubMCPServerAdapter"]
        CacheSrv["RedisCacheService"]
    end

    %% Flow connections
    RouterLayer --> Security
    RouterLayer --> LogicLayer
    LogicLayer --> AdapterLayer
```

---

## 4. AI Agent Pipeline

This sequence traces the agentic pipeline execution steps when a user inputs a natural language query in the MetaPilot Workspace.

```mermaid
sequenceDiagram
    autonumber
    actor User as Vite Client Page
    participant Orchestrator as Agent Orchestrator
    participant Retriever as Semantic Retriever
    participant DataHub as DataHub Client
    participant Prompt as Prompt Engine
    participant LLM as Google Gemini
    participant Validator as Schema Validator

    User->>Orchestrator: Send query ("Join snowflake raw users and orders")
    activate Orchestrator
    
    Orchestrator->>Retriever: Retrieve semantic schema context
    activate Retriever
    Retriever-->>Orchestrator: Return top-k matching tables & files
    deactivate Retriever

    Orchestrator->>DataHub: Fetch live lineage and owners for URNs
    activate DataHub
    DataHub-->>Orchestrator: Return schemas, lineages, owners
    deactivate DataHub

    Orchestrator->>Orchestrator: Assemble and clean context templates
    
    Orchestrator->>Prompt: Compile system instructs + RAG context + user query
    activate Prompt
    Prompt-->>Orchestrator: Return formatted input prompt
    deactivate Prompt

    Orchestrator->>LLM: Dispatch generation prompt (stream model output)
    activate LLM
    LLM-->>User: Stream SSE Character chunks (JSON response)
    deactivate LLM

    Orchestrator->>Validator: Validate generated SQL/YAML syntax
    activate Validator
    Validator-->>Orchestrator: Return check logs (validation status)
    deactivate Validator

    Orchestrator->>User: Stream final validation and telemetry properties
    Orchestrator->>Orchestrator: Log chat message to session history
    deactivate Orchestrator
```

---

## 5. RAG Pipeline Architecture

MetaPilot's RAG pipeline operates on a fallback model to ensure robustness in diverse development and deployment environments.

```mermaid
graph TD
    Query[User Query String] --> Embed["EmbeddingService\n(SentenceTransformers)"]
    Embed --> Check{"Is ChromaDB\nActive?"}
    
    Check -->|Yes| QueryChroma["Query ChromaDB Collection"]
    Check -->|No| QuerySQLite["Query SQLite Fallback DB\n(Cosine Similarity in Python)"]
    
    QueryChroma --> Match["Match Top-K Contexts"]
    QuerySQLite --> Match
    
    Match --> MetadataFilter{"Apply Platform\n& Owner Filters"}
    MetadataFilter --> Boost{"Apply Keyword\nSimilarity Boost"}
    
    Boost --> Sort["Rank Contexts by Score"]
    Sort --> Return["Inject Schema Details into Prompt"]
```

---

## 6. DataHub Integration Topology

This shows how MetaPilot connects to DataHub Core GMS (GraphQL and REST) to gather metadata, falling back to mock files when offline.

```mermaid
graph TD
    subgraph MetaPilot ["MetaPilot Application Server"]
        ClientWrapper["DataHubAsyncClient"]
        MCPServer["DataHubMCPServerAdapter"]
    end

    subgraph DataHubGMS ["LinkedIn DataHub Core"]
        GMSHealth["/health HTTP Endpoint"]
        GraphQL["/api/graphql Endpoint"]
    end

    subgraph MockRegistry ["Offline Cache Database"]
        MockData["FALLBACK_CATALOG (in-memory dictionary)"]
    end

    %% Network Connections
    ClientWrapper -->|1. Poll status| GMSHealth
    GMSHealth -->|2a. Healthy| ClientWrapper
    
    ClientWrapper -->|3. GraphQL request| GraphQL
    GraphQL -->|4. Return schemas & tags| ClientWrapper
    
    GMSHealth -.->|2b. Unreachable / Timeout| MockRegistry
    ClientWrapper -->|5. Redirect query| MockData
    MockData -->|6. Return static schemas| ClientWrapper

    MCPServer -->|Retrieve schema/lineage| ClientWrapper
```

---

## 7. Authentication Protocol Flow

A secure authentication sequence, mapping credential verification, database queries, and signed JWT token exchanges.

```mermaid
sequenceDiagram
    autonumber
    actor Client as React UI Client
    participant AuthRouter as Auth Route Handler
    participant DB as PostgreSQL Store
    participant TokenManager as JWT Token Builder

    Note over Client, TokenManager: Login Sequence
    Client->>AuthRouter: POST /api/auth/login (email, password)
    activate AuthRouter
    AuthRouter->>DB: Fetch user matching email credentials
    activate DB
    DB-->>AuthRouter: Return user record (including hash)
    deactivate DB
    
    AuthRouter->>AuthRouter: Match hashes (bcrypt verify)
    
    alt Credentials Valid
        AuthRouter->>TokenManager: Build access token (claims, expiration)
        activate TokenManager
        TokenManager-->>AuthRouter: Return signed JWT string
        deactivate TokenManager
        AuthRouter-->>Client: Return HTTP 200 (access_token, user_details)
    else Credentials Invalid
        AuthRouter-->>Client: Return HTTP 401 Unauthorized
    end
    deactivate AuthRouter

    Note over Client, TokenManager: Authenticated Requests
    Client->>AuthRouter: GET /api/ai/sessions (Header: Bearer JWT)
    activate AuthRouter
    AuthRouter->>TokenManager: Decode and verify signature
    activate TokenManager
    TokenManager-->>AuthRouter: Return validated user identity claims
    deactivate TokenManager
    AuthRouter->>DB: Query sessions index for user
    activate DB
    DB-->>AuthRouter: Return session records
    deactivate DB
    AuthRouter-->>Client: Return sessions list (HTTP 200)
    deactivate AuthRouter
```

---

## 8. Database ER Schema

The database diagram mappings showing connections between users, workspace definitions, audit logs, and conversation logs.

```mermaid
erDiagram
    USERS {
        int id PK
        string email UK
        string hashed_password
        string name
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    WORKSPACES {
        int id PK
        string name
        int owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string details
        string ip_address
        timestamp created_at
    }

    CHAT_SESSIONS {
        uuid id PK
        int user_id FK
        string title
        timestamp created_at
        timestamp updated_at
    }

    CHAT_MESSAGES {
        int id PK
        uuid session_id FK
        string sender_role
        string message_text
        jsonb telemetry_logs
        timestamp created_at
    }

    %% Relationships
    USERS ||--o{ WORKSPACES : "defines"
    USERS ||--o{ AUDIT_LOGS : "logs actions"
    USERS ||--o{ CHAT_SESSIONS : "starts"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "contains"
```

---

## 9. HTTP Request/Response Lifecycle

The request execution path highlighting rate limits, logging interceptors, authorization checkpoints, execution threads, and server-sent event loops.

```mermaid
graph TD
    Request[Client HTTP/SSE Request] --> CORS{CORS Check}
    CORS -->|Fail| DenyCORS[Return HTTP 403 Forbidden]
    CORS -->|Pass| Logger["RequestLoggingMiddleware\n(Log incoming route)"]
    
    Logger --> RateLimiter{"Verify Rate Limit\n(Redis counter)"}
    RateLimiter -->|Limit Exceeded| Throttle[Return HTTP 429 Too Many Requests]
    RateLimiter -->|Pass| JWTChecker{"Extract & Decode JWT\n(Security dependency)"}
    
    JWTChecker -->|Invalid Token| DenyAuth[Return HTTP 401 Unauthorized]
    JWTChecker -->|Valid User| RouteHandler["Execute Endpoint Router\n(Controller logic)"]
    
    RouteHandler --> DBTask["Query PostgreSQL / SQLite\n(DB Session)"]
    DBTask --> ResponseFormat{"Is Streaming Route?"}
    
    ResponseFormat -->|Yes| SSE["Stream server-sent chunks\n(Yield SSE events)"]
    ResponseFormat -->|No| JSON["Serialize Pydantic Model\n(Standard JSON)"]
    
    SSE --> MeasureTime["Log Process-Time Header"]
    JSON --> MeasureTime
    
    MeasureTime --> ClientResponse[Client Receives Response]
```

---

## 10. Deployment Architecture

The physical multi-node hosting map for production distributions, indicating Secure Sockets (SSL), proxies, container servers, and database nodes.

```mermaid
graph TD
    subgraph PublicInternet ["Public Internet Services"]
        DNS["DNS Router\n(Domain settings)"]
        User["User Browser Session"]
    end

    subgraph VercelCDN ["Vercel Edge Platform"]
        VEdge["Vercel Global CDN"]
        ReactApp["React / TS Assets\n(Static Bundle)"]
    end

    subgraph RenderPlatform ["Render Cloud Hosting"]
        Proxy["Render Load Balancer & SSL\n(Nginx Gateway)"]
        FastAPIContainer["FastAPI Docker Instance\n(Python API Server)"]
    end

    subgraph ManagedDB ["Managed Database Platforms"]
        CloudPostgres[("AWS RDS / Render DB\n(PostgreSQL Server)")]
        UpstashRedis[("Upstash Redis\n(Cache Instance)")]
    end

    %% Network flows
    User -->|1. Request app| DNS
    DNS -->|2. Resolve React app| VEdge
    VEdge -->|3. Stream assets| ReactApp
    ReactApp -->|4. Return page| User
    
    User -->|5. Secure API call (HTTPS/SSE)| Proxy
    Proxy -->|6. Reverse proxy| FastAPIContainer
    
    FastAPIContainer <-->|7. DB session| CloudPostgres
    FastAPIContainer <-->|8. Cache session| UpstashRedis
```
