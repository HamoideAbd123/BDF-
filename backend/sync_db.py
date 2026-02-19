from backend.core.config import settings
from backend.core.database import engine, Base
import os
from backend.models.invoice import Document, Invoice
from sqlalchemy import text, inspect

def sync_db():
    print(f"DATABASE_URL being used: {settings.DATABASE_URL}")
    print(f"Current working directory: {os.getcwd()}")
    print("Synchronizing database...")
    
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f"Existing tables: {existing_tables}")
    
    if "invoices" not in existing_tables:
        print("ERROR: 'invoices' table still not found after create_all!")
        return

    with engine.connect() as conn:
        with conn.begin():
            
            # Additional check for columns that might have been added manually in previous steps
            # or need to be ensured.
            columns_to_add = [
                ("document_type", "VARCHAR"),
                ("summary", "TEXT"),
                ("raw_content", "TEXT"),
                ("file_path", "VARCHAR")
            ]
            
            for col_name, col_type in columns_to_add:
                try:
                    conn.execute(text(f"ALTER TABLE invoices ADD COLUMN {col_name} {col_type}"))
                    print(f"Added column: {col_name}")
                except Exception as e:
                    # Column might already exist
                    if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                        print(f"Column {col_name} already exists.")
                    else:
                        print(f"Error adding {col_name}: {e}")

    print("Database synchronization complete.")

if __name__ == "__main__":
    sync_db()
