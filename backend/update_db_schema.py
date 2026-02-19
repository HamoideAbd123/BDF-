from sqlalchemy import text
from core.database import engine

def upgrade_db():
    print("Upgrading database schema...")
    with engine.connect() as connection:
        with connection.begin():
            cols = [
                ("doc_type", "VARCHAR"),
                ("summary", "TEXT"),
                ("verified", "BOOLEAN DEFAULT 0"),
                ("audit_log", "JSON")
            ]
            
            for col_name, col_type in cols:
                try:
                    connection.execute(text(f"ALTER TABLE invoices ADD COLUMN {col_name} {col_type}"))
                    print(f"Added {col_name} column.")
                except Exception as e:
                    print(f"Skipping {col_name} (might exist): {e}")

if __name__ == "__main__":
    upgrade_db()
