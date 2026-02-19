from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from core.database import get_db
from models.invoice import Invoice
from datetime import datetime

router = APIRouter()

# Pydantic models for the request
class ReviewField(BaseModel):
    value: Any
    confidence: float
    source: str
    original_value: Optional[Any] = None

class ReviewLineItem(BaseModel):
    id: str
    description: ReviewField
    quantity: ReviewField
    unit_price: ReviewField
    amount: ReviewField

class ReviewData(BaseModel):
    document_id: Optional[int] = None
    invoice_id: Optional[int] = None
    invoice_number: ReviewField
    date: ReviewField
    vendor_name: ReviewField
    total_amount: ReviewField
    tax_amount: ReviewField
    currency: str
    line_items: List[ReviewLineItem] = []

class AuditLog(BaseModel):
    timestamp: str
    changes: List[Any]

class ApproveRequest(BaseModel):
    data: ReviewData
    auditLog: AuditLog

@router.post("/approve")
async def approve_invoice(request: ApproveRequest, db: Session = Depends(get_db)):
    """
    Approve an invoice after manual review.
    Updates the invoice record with the reviewed data.
    """
    invoice_id = request.data.invoice_id
    
    # Try to resolve invoice_id from document_id if missing
    if not invoice_id and request.data.document_id:
        inv = db.query(Invoice).filter(Invoice.document_id == request.data.document_id).first()
        if inv:
            invoice_id = inv.id
            
    if not invoice_id:
         # Just a warning if we can't find it, or maybe return mock success for now if strictly UI testing?
         # But better to return 404 if we really can't find it.
         # For robustness given previous "mock" state of app, let's return 404.
         raise HTTPException(status_code=404, detail="Invoice ID not found in request")

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    # Update fields from the 'value' of the reviewed data
    invoice.vendor = str(request.data.vendor_name.value)
    invoice.invoice_number = str(request.data.invoice_number.value)
    
    # Date parsing
    date_val = request.data.date.value
    if date_val:
        try:
             # Handle YYYY-MM-DD
             if isinstance(date_val, str):
                 invoice.date = datetime.strptime(date_val, "%Y-%m-%d").date()
        except Exception as e:
            print(f"Error parsing date {date_val}: {e}")
            pass
            
    # Numeric fields
    invoice.total = request.data.total_amount.value
    invoice.tax = request.data.tax_amount.value
    invoice.currency = request.data.currency
    
    # Audit trail & verification flag
    invoice.verified = True
    # Convert AuditLog pydantic model to dict for JSON column
    invoice.audit_log = request.auditLog.model_dump() if request.auditLog else None
    
    # Save changes
    db.commit()
    
    return {"status": "approved", "id": invoice_id}
