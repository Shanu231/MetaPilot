# MetaPilot Project Directory Directory Structure

This document details the layout of the MetaPilot project repository. It outlines where backend code, frontend files, database assets, and document files are located.

---

```
MetaPilot/
├── .github/                       # GitHub workflow and template files
│   ├── ISSUE_TEMPLATE/            # Templates for bug reports and feature requests
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md   # Template for formatting pull requests
├── backend/                       # Python FastAPI Backend codebase
│   ├── app/                       # Main application module
│   │   ├── api/                   # API endpoint route handlers
│   │   │   ├── auth.py            # Authentication, registration, login
│   │   │   ├── chat.py            # AI session chat & SSE stream response
│   │   │   ├── automation.py      # Code files generation endpoints
│   │   │   └── vector.py          # Vector store query & telemetry
│   │   ├── core/                  # Configuration, logging, settings
│   │   │   ├── config.py          # Settings validation & loading
│   │   │   └── logging.py         # App logger settings
│   │   ├── database/              # DB sessions and initialization
│   │   │   ├── db.py              # Async SQLAlchemy engine
│   │   │   └── setup.py           # DB creation hooks
│   │   ├── dependencies/          # Security authentication dependencies
│   │   │   └── auth.py            # JWT token validation filters
│   │   ├── middleware/            # FastAPI middleware interceptors
│   │   │   ├── logging.py         # Requests/responses tracing logs
│   │   │   └── rate_limiter.py    # Redis rate controller
│   │   ├── models/                # SQLAlchemy database models
│   │   │   ├── user.py            # USERS table mappings
│   │   │   ├── workspace.py       # WORKSPACES table mappings
│   │   │   ├── chat.py            # CHAT_SESSIONS & CHAT_MESSAGES mappings
│   │   │   └── audit.py           # AUDIT_LOGS table mappings
│   │   ├── schemas/               # Pydantic validation schemas
│   │   │   ├── user.py            # User login/out request schemas
│   │   │   ├── chat.py            # Chat telemetry validation
│   │   │   └── automation.py      # Generate request schemas
│   │   ├── integrations/          # External services wrappers
│   │   │   ├── cache/             # Redis caching methods
│   │   │   ├── datahub/           # GraphQL GMS client client
│   │   │   │   ├── client.py      # Core HTTP clients & fallbacks
│   │   │   │   └── seed.py        # Seed script for fallback indexers
│   │   │   ├── graph/             # Lineage dependency nodes
│   │   │   ├── mcp/               # Model Context Protocol adapter
│   │   │   │   └── server.py      # MCP DataHub tool endpoints
│   │   │   └── exceptions/        # Service-specific custom exceptions
│   │   ├── ai/                    # Reasoning agent & generator engine
│   │   │   ├── engines/           # NLP utilities
│   │   │   │   ├── prompt_engine.py # Prompts version compiler
│   │   │   │   ├── response_parser.py # Syntax block code parsers
│   │   │   │   └── usage_tracker.py # Latency and token logs
│   │   │   ├── generators/        # Automation generators
│   │   │   │   ├── sql.py         # SQL queries synthesizers
│   │   │   │   ├── dbt.py         # dbt model and configuration compiler
│   │   │   │   └── airflow.py     # Python Airflow TaskFlow writer
│   │   │   └── providers/         # Language model adapters
│   │   │       ├── factory.py     # LLM provider loader factory
│   │   │       ├── gemini.py      # Google Gemini provider client
│   │   │       └── groq.py        # Groq endpoint client client
│   │   └── main.py                # App entrypoint (Uvicorn configuration)
│   ├── requirements.txt           # Python backend dependencies index
│   └── pytest.ini                 # Pytest runner settings
├── docs/                          # Guides and diagrams
│   ├── demo/                      # Scripts and walkthrough packages
│   │   ├── demo_script.md         # Video narration & technical pitches
│   │   └── judge_experience.md    # Judges setup & testing instructions
│   ├── Architecture.md            # System layout mapping with Mermaid
│   ├── SetupGuide.md              # Installation details
│   ├── DeveloperGuide.md          # Layout guidelines for contributors
│   ├── DeploymentGuide.md         # Cloud deployments guide
│   ├── EnvironmentVariables.md    # Core configuration details
│   ├── FolderStructure.md         # Folder map (this file)
│   ├── Security.md                # Vulnerability disclosures guide
│   ├── Contributing.md            # Guidelines for PRs and issues
│   ├── Troubleshooting.md         # Error remediation index
│   └── CHANGELOG.md               # Version 1.0.0 milestones index
├── src/                           # React frontend application
│   ├── api/                       # REST client and SSE controllers
│   ├── assets/                    # Static branding graphics
│   ├── components/                # Modular UI widgets
│   ├── hooks/                     # Local storage and state controls
│   ├── layouts/                   # Global page routing frames
│   ├── pages/                     # Routing screens
│   │   ├── LandingPage.tsx        # Public marketing pitch landing
│   │   ├── WorkspacePage.tsx      # Multi-pane chat and split-editor
│   │   ├── LineagePage.tsx        # Lineage dependency map page
│   │   ├── SettingsPage.tsx       # Configurations and judge switch page
│   │   └── AnalyticsPage.tsx      # System tracking charts
│   ├── providers/                 # CSS theme and authentication states
│   └── main.tsx                   # Vite bundler entrance script
├── public/                        # Public static web browser assets
├── index.html                     # HTML root landing file
├── package.json                   # NPM frontend package dependencies
├── tailwind.config.js             # Styling tokens mapping
└── docker-compose.yml             # Local service containers setup
```
