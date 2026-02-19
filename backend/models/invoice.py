from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, DateTime, Enum as SqlEnum, Text, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
from models.task_status import ProcessingStatus

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    batch_id = Column(String, index=True, nullable=True)
    status = Column(SqlEnum(ProcessingStatus), default=ProcessingStatus.PENDING)

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), unique=True, nullable=False)
    invoice_number = Column(String, nullable=True)
    date = Column(Date, nullable=True)
    vendor = Column(String, nullable=True)
    total = Column(Numeric(10, 2), nullable=True)
    tax = Column(Numeric(10, 2), nullable=True)
    currency = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    doc_type = Column(String, nullable=True) # "invoice", "receipt", "general_document", "error_fallback"
    summary = Column(Text, nullable=True) 
    raw_content = Column(Text, nullable=True)
    
    # Audit & Verification
    verified = Column(Boolean, default=False)
    audit_log = Column(JSON, nullable=True) # To store manual changes

    document = relationship("Document")
    line_items = relationship("LineItem", back_populates="invoice", cascade="all, delete-orphan")

class LineItem(Base):
    __tablename__ = "line_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Numeric(10, 2), nullable=True)
    unit_price = Column(Numeric(10, 2), nullable=True)
    total_price = Column(Numeric(10, 2), nullable=True)
    discount = Column(Numeric(10, 2), nullable=True)

    invoice = relationship("Invoice", back_populates="line_items")


