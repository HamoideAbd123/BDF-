import os

class PromptManager:
    def __init__(self, base_path="prompts"):
        # Use absolute path if possible or ensure it works relative to the root
        # Determining absolute path for robustness
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.base_path = os.path.join(os.path.dirname(current_dir), base_path)

    def get_prompt(self, category, filename):
        path = os.path.join(self.base_path, category, filename)
        if not os.path.exists(path):
            # Fallback if specific file doesn't exist
            return ""
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def determine_doc_type(self, ocr_text):
        """
        مرحلة سريعة جداً لتصنيف المستند قبل البدء بالاستخراج العميق
        """
        # كلمات مفتاحية بسيطة لتوفير استهلاك الـ AI
        ocr_lower = ocr_text.lower()
        if "receipt" in ocr_lower or "total cash" in ocr_lower:
            return "receipt"
        elif "invoice" in ocr_lower or "bill to" in ocr_lower:
            return "invoice"
        else:
            return "generic"

    def get_structured_prompt(self, ocr_text):
        doc_type = self.determine_doc_type(ocr_text)
        
        # اختيار الـ Prompt بناءً على النوع
        if doc_type == "receipt":
            task_file = "receipt_v1.txt" # تأكد من إنشاء هذا الملف
        else:
            task_file = "invoice_extraction_v1.txt"
            
        system_prompt = self.get_prompt("system", "parser_v1.txt")
        task_template = self.get_prompt("tasks", task_file)
        
        # If prompts are empty, fallback to a basic template
        if not system_prompt or not task_template:
            return "", ocr_text

        return system_prompt, task_template.replace("{{ocr_text}}", ocr_text)
