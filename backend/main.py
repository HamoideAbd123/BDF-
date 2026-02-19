from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, result, invoice, dashboard
from core.database import engine, Base

# Create tables
# Note: In production you should use Alembic migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Financial Data Extraction API")

# ... (omitting CORS for brevity, will match exactly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(result.router, prefix="/api/v1", tags=["Result"])
app.include_router(invoice.router, prefix="/api/v1/invoice", tags=["Invoice"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

@app.get("/")
def read_root():
    return {"message": "Financial Data Extraction API is running"}
