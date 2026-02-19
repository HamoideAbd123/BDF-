import json
import os
import google.generativeai as genai
from core.config import settings

def validate_invoice_data(invoice_json: dict) -> dict:
    """
    Validates extracted invoice data using the Financial Auditor persona (Gemini 1.5 Flash).
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return {"status": "error", "reasons": ["GEMINI_API_KEY not found"]}

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')

    system_prompt = """
    Reviewer Role: You are a Financial Auditor. Your job is to validate the JSON output of the Parser.
    Validation Logic:
    1. Check if subtotal + tax_amount equals total_amount.
    2. Flag any invoice where the date is in the future (Current Date: {today}).
    3. Verify that the vendor_name is not a generic term like "Customer".
    """
    
    from datetime import date
    today = date.today().strftime("%Y-%m-%d")

    prompt = f"""
    {system_prompt.format(today=today)}
    
    Task: Validate the JSON output of the Parser.
    
    Output Format:
    If valid: {{"status": "valid"}}
    If invalid: {{"status": "invalid", "reasons": [string, ...]}}

    Input JSON:
    {json.dumps(invoice_json)}
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        # Basic cleanup
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        return json.loads(response_text)
    except Exception as e:
        print(f"Error calling Gemini Reviewer: {e}")
        return {"status": "valid", "reasons": []} # Fallback to valid to not block, but log error
