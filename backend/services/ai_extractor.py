import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def extract_invoice_data_ai(text: str) -> dict:
    """
    Extracts invoice data using Google Gemini 1.5 Flash.
    Returns a JSON object with extracted fields or document summary.
    """
    from core.config import settings
    from services.prompt_loader import PromptManager
    
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        return {}

    genai.configure(api_key=api_key)
    
    manager = PromptManager()
    system_prompt, full_prompt = manager.get_structured_prompt(text)
    
    # If PromptManager failed to find files, fallback to inline
    if not system_prompt:
        system_prompt = "You are a world-class Document AI Specialist. Your expertise is in converting unstructured OCR text from invoices into highly accurate, structured JSON data."
        full_prompt = f"""
        Task: Extract key-value pairs from the following OCR text.
        Target Schema:
        {{
          "vendor_info": {{"name": string}},
          "invoice_details": {{"number": string, "date": "YYYY-MM-DD"}},
          "financials": {{"total_amount": float, "currency": "ISO"}},
          "items": []
        }}
        Text: {text}
        """

    # Using system_instruction as requested by the user
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        system_instruction=system_prompt
    )

    try:
        response = model.generate_content(full_prompt)
        # Clean up code blocks if present
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
             response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        result = json.loads(response_text)
        if "error" in result:
             raise ValueError(result["error"])
        return result
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise ValueError("No invoice data found or AI processing failed")
