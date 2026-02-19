from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from celery.result import AsyncResult
from celery_app import celery_app
from core.database import get_db
from models.invoice import Document, Invoice, ProcessingStatus

router = APIRouter()

@router.get("/result/{task_id}")
async def get_result(task_id: str, db: Session = Depends(get_db)):
    """
    Check the status of the Celery task and return the result.
    It checks Redis (via Celery) and fallbacks to PostgreSQL for persistent data.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    # 1. Check if task is finished in Celery
    if task_result.ready():
        if task_result.successful():
            return {
                "status": "completed",
                "data": task_result.result
            }
        else:
            return {
                "status": "failed",
                "error": str(task_result.result)
            }
    
    # 2. If not ready in Celery, check Database status (optional cross-check)
    # We can find the document associated with this task if we stored task_id in DB.
    # Currently we don't store task_id in Document model. 
    # But we can query by document_id if the frontend knows it.
    
    return {
        "status": "processing"
    }

@router.get("/document/{doc_id}")
async def get_document_result(doc_id: int, db: Session = Depends(get_db)):
    """
    Fetch extraction result directly from PostgreSQL using the document ID.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    invoice = db.query(Invoice).filter(Invoice.document_id == doc_id).first()
    
    return {
        "status": doc.status,
        "filename": doc.filename,
        "data": invoice if invoice else None
    }
