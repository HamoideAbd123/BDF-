from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, timedelta
from core.database import get_db
from models.invoice import Invoice
from models.task_status import ProcessingStatus
from fastapi.responses import StreamingResponse
import io
from openpyxl import Workbook
import pandas as pd

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    # Total Spend (Only verified/approved)
    total_spend = db.query(func.sum(Invoice.total)).filter(Invoice.verified == True).scalar() or 0
    
    # Pending Reviews (Created but not verified)
    pending_reviews = db.query(func.count(Invoice.id)).filter(Invoice.verified == False).scalar() or 0
    
    # Monthly Growth
    now = datetime.now()
    first_day_of_current_month = now.replace(day=1)
    last_day_of_last_month = first_day_of_current_month - timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)
    
    current_month_spend = db.query(func.sum(Invoice.total)).filter(
        Invoice.verified == True,
        Invoice.date >= first_day_of_current_month
    ).scalar() or 0
    
    last_month_spend = db.query(func.sum(Invoice.total)).filter(
        Invoice.verified == True,
        Invoice.date >= first_day_of_last_month,
        Invoice.date <= last_day_of_last_month
    ).scalar() or 0
    
    growth = 0
    if last_month_spend > 0:
        growth = ((current_month_spend - last_month_spend) / last_month_spend) * 100
    elif current_month_spend > 0:
        growth = 100 # From 0 to something
        
    return {
        "totalSpend": float(total_spend),
        "pendingReviews": int(pending_reviews),
        "monthlyGrowth": round(float(growth), 2)
    }

@router.get("/invoices")
async def get_invoices(
    vendor: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Invoice)
    
    if vendor:
        query = query.filter(Invoice.vendor.ilike(f"%{vendor}%"))
    
    if start_date:
        query = query.filter(Invoice.date >= datetime.strptime(start_date, "%Y-%m-%d").date())
        
    if end_date:
        query = query.filter(Invoice.date <= datetime.strptime(end_date, "%Y-%m-%d").date())
        
    invoices = query.order_by(Invoice.date.desc()).all()
    
    return [
        {
            "id": inv.id,
            "vendor": inv.vendor,
            "date": inv.date.isoformat() if inv.date else None,
            "total": float(inv.total) if inv.total else 0,
            "currency": inv.currency,
            "status": "Approved" if inv.verified else "Pending Review"
        }
        for inv in invoices
    ]

@router.get("/chart")
async def get_chart_data(db: Session = Depends(get_db)):
    # Spend over the last 6 months
    today = datetime.now()
    six_months_ago = today - timedelta(days=180)
    
    # SQLite friendly query using func.strftime or just manual aggregation if volume is low?
    # Let's try to do it as a query.
    # Note: SQLite date extraction is tricky in SQLAlchemy
    
    results = db.query(
        extract('year', Invoice.date).label('year'),
        extract('month', Invoice.date).label('month'),
        func.sum(Invoice.total).label('total')
    ).filter(
        Invoice.verified == True,
        Invoice.date >= six_months_ago.date()
    ).group_by('year', 'month').order_by('year', 'month').all()
    
    chart_data = []
    for r in results:
        month_name = datetime(int(r.year), int(r.month), 1).strftime("%b")
        chart_data.append({
            "name": f"{month_name} {int(r.year)}",
            "spend": float(r.total)
        })
        
    return chart_data

@router.get("/status-distribution")
async def get_status_distribution(db: Session = Depends(get_db)):
    # Counts of Approved vs Pending Review
    approved = db.query(func.count(Invoice.id)).filter(Invoice.verified == True).scalar() or 0
    pending = db.query(func.count(Invoice.id)).filter(Invoice.verified == False).scalar() or 0
    
    return [
        {"name": "Approved", "value": approved, "color": "#10b981"}, # emerald-500
        {"name": "Pending", "value": pending, "color": "#f59e0b"}   # amber-500
    ]

@router.get("/export")
async def export_invoices(
    vendor: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Invoice)
    if vendor: query = query.filter(Invoice.vendor.ilike(f"%{vendor}%"))
    if start_date: query = query.filter(Invoice.date >= datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date: query = query.filter(Invoice.date <= datetime.strptime(end_date, "%Y-%m-%d").date())
    
    invoices = query.all()
    
    data = []
    for inv in invoices:
        data.append({
            "Vendor": inv.vendor,
            "Invoice #": inv.invoice_number,
            "Date": inv.date.isoformat() if inv.date else "",
            "Amount": float(inv.total) if inv.total else 0,
            "Currency": inv.currency,
            "Status": "Approved" if inv.verified else "Pending Review"
        })
    
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Invoices')
    
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="invoices_export.xlsx"'
    }
    
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
