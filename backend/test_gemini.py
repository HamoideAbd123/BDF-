from services.ai_extractor import extract_invoice_data_ai
from core.config import settings

def test_gemini():
    print("Testing Gemini Integration...")
    if not settings.GEMINI_API_KEY:
        print("WARNING: GEMINI_API_KEY is not set. Skipping real API call.")
        return

    text = """
    INVOICE
    Invoice Number: INV-001
    Date: 2023-10-25
    Vendor: Acme Corp
    Total: $500.00
    Currency: USD
    """
    
    print(f"Sending text: {text}")
    try:
        result = extract_invoice_data_ai(text)
        print("Result:", result)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_gemini()
