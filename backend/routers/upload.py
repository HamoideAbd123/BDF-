from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
import os
import shutil
from core.database import get_db
from models.invoice import Document, ProcessingStatus
from tasks.process_file import process_invoice_task

router = APIRouter()

TEMP_STORAGE = "temp_storage"
os.makedirs(TEMP_STORAGE, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Uploads a file, saves it, creates a DB record, and triggers the Celery processing task.
    """
    # 1. Save file locally
    file_path = f"{TEMP_STORAGE}/{file.filename}"
    
    # Use shutil for efficient large file saving
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Create Document record in DB
    new_doc = Document(
        filename=file.filename,
        file_path=file_path,
        status=ProcessingStatus.PENDING
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # 3. Trigger Celery Task
    task = process_invoice_task.delay(file_path, new_doc.id)

    return {
        "status": "processing",
        "task_id": task.id,
        "document_id": new_doc.id,
        "filename": file.filename
    }
