from celery_app import celery_app
from services.pdf_reader import extract_text_from_pdf
from services.ai_extractor import extract_invoice_data_ai
from core.database import SessionLocal
from models.invoice import Document, Invoice, LineItem
from models.task_status import ProcessingStatus
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import traceback
import os

logger = logging.getLogger(__name__)

@celery_app.task(name="process_invoice_task", bind=True)
def process_invoice_task(self, file_path: str, document_id: int):
    """
    Celery task to process an uploaded invoice file.
    """
    db: Session = SessionLocal()
    doc = None
    try:
        logger.info(f"Processing invoice file: {file_path} (Doc ID: {document_id})")
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # 1. Update status to PROCESSING
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = ProcessingStatus.PROCESSING
            db.commit()

        # 2. Extract Text
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            raw_text = extract_text_from_pdf(file_path)
        else:
            from services.ocr import extract_text_from_image
            raw_text = extract_text_from_image(file_path)
        
        if not raw_text:
            logger.warning("No text extracted.")
            raw_text = ""

        # 3. AI Analysis
        from services.prompt_loader import PromptManager
        manager = PromptManager()
        doc_type = manager.determine_doc_type(raw_text)
        
        extracted_data = extract_invoice_data_ai(raw_text)
        
        # 4. AI Validation (Auditor Role)
        from services.ai_reviewer import validate_invoice_data
        validation_result = validate_invoice_data(extracted_data)
        
        # 5. Save to DB
        vendor_info = extracted_data.get("vendor_info", {})
        invoice_details = extracted_data.get("invoice_details", {})
        financials = extracted_data.get("financials", {})
        items = extracted_data.get("items", [])

        invoice_date = None
        date_str = invoice_details.get("date")
        if date_str:
            try:
                invoice_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except (ValueError, TypeError):
                logger.warning(f"Could not parse date string: {date_str}")
        
        # Create Invoice record
        new_invoice = Invoice(
            document_id=document_id,
            invoice_number=invoice_details.get("number"),
            date=invoice_date,
            vendor=vendor_info.get("name"),
            total=financials.get("total_amount"),
            tax=financials.get("tax_amount"),
            currency=financials.get("currency"),
            file_path=file_path,
            doc_type=doc_type,
            summary=extracted_data.get("summary"),
            raw_content=raw_text
        )
        
        db.add(new_invoice)
        db.flush() # Get invoice ID for line items

        # Create LineItem records
        for item in items:
            line_item = LineItem(
                invoice_id=new_invoice.id,
                description=item.get("description"),
                quantity=item.get("quantity"),
                unit_price=item.get("unit_price"),
                total_price=item.get("total_price"),
                discount=item.get("discount")
            )
            db.add(line_item)
        
        # 6. Update Document status to COMPLETED
        if doc:
            doc.status = ProcessingStatus.COMPLETED
        
        db.commit()
        
        # Add IDs and validation result to the result so frontend can use them
        extracted_data['document_id'] = document_id
        extracted_data['invoice_id'] = new_invoice.id
        extracted_data['validation_result'] = validation_result
        
        return extracted_data

    except Exception as e:
        logger.error(f"Error processing invoice: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Rollback the transaction to avoid PendingRollbackError
        db.rollback()
        
        # fallback: Save raw text if available so we don't lose data
        # We need a new transaction
        try:
            if 'raw_text' in locals() and raw_text and document_id:
                 # Check if invoice already exists to avoid unique constraint error?
                 # Actually, if we rolled back, the invoice insert is gone.
                 # So we can insert a partial invoice with raw_content.
                 db_fallback = SessionLocal()
                 try:
                     fallback_invoice = Invoice(
                         document_id=document_id,
                         file_path=file_path,
                         raw_content=raw_text,
                         doc_type="error_fallback"
                     )
                     db_fallback.add(fallback_invoice)
                     db_fallback.commit()
                     logger.info("Saved fallback raw content for failed document.")
                 except Exception as fallback_e:
                     logger.error(f"Failed to save fallback raw content: {fallback_e}")
                 finally:
                     db_fallback.close()

        except Exception as outer_e:
             logger.error(f"Error in fallback logic: {outer_e}")

        # Update Document status to FAILED
        try:
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = ProcessingStatus.FAILED
                db.commit()
        except Exception as inner_e:
            logger.error(f"Failed to update document status to FAILED: {inner_e}")
            
        raise e
    finally:
        db.close()
