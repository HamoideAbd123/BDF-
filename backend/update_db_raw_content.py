from sqlalchemy import text
from core.database import engine

def upgrade_db_raw_content():
    print("Upgrading database schema for raw_content...")
    with engine.connect() as connection:
        with connection.begin():
            try:
                connection.execute(text("ALTER TABLE invoices ADD COLUMN raw_content VARCHAR"))
                print("Added raw_content column.")
            except Exception as e:
                print(f"Skipping raw_content (might exist): {e}")

if __name__ == "__main__":
    upgrade_db_raw_content()
