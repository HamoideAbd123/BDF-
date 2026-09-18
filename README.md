# BDF

BDF is a full-stack document and invoice processing application built around a Python FastAPI backend, asynchronous Celery jobs, document/OCR processing, and a web dashboard.

## Main Components

- `backend/` — API, configuration, database layer, models, routers, services, and asynchronous processing.
- `frontend/` — web dashboard and client-side application.
- `prompts/` — AI extraction/prompt resources.
- `docker-compose.yml` — local multi-service orchestration.

## Backend Structure

```text
backend/
├── core/              # Configuration and database infrastructure
├── models/            # Domain/data models
├── routers/           # HTTP API endpoints
├── services/          # OCR, PDF, AI extraction, and supporting services
├── celery_app.py      # Celery application
├── main.py            # FastAPI application entry point
├── requirements.txt   # Python dependencies
├── Dockerfile
└── .env.example
```

## Technology

- Python / FastAPI
- Celery
- Redis
- OCR and PDF processing
- AI-assisted document extraction
- Web frontend
- Docker Compose

## Development

Create the environment variables from `backend/.env.example`, install the dependencies from `backend/requirements.txt`, and start the required services according to `docker-compose.yml`.

## Documentation

- `backend/README.md` — backend-specific notes
- `backend/implementation_plan.md` — implementation planning
- `prompts/` — prompt and extraction resources

## Repository Hygiene

Generated Python `__pycache__` files are currently present in the repository tree. They should be removed from version control and covered by `.gitignore` in a dedicated cleanup commit. No source code should be moved until imports and deployment paths are checked.

## Status

Active development. The repository structure is being standardized to make the project easier to maintain and easier for AI coding tools to understand.
