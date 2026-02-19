import pytesseract
from PIL import Image
from core.config import settings

# Tesseract Configuration
pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH

def extract_text_from_image(image_path: str, lang: str = 'eng+ara') -> str:
    """Extracts text from an image file using Tesseract OCR."""
    try:
        return pytesseract.image_to_string(Image.open(image_path), lang=lang)
    except Exception as e:
        print(f"Error extracting text from image {image_path}: {e}")
        return ""

def extract_text_from_image_object(image: Image.Image, lang: str = 'eng+ara') -> str:
    """Extracts text from a PIL Image object."""
    try:
        return pytesseract.image_to_string(image, lang=lang)
    except Exception as e:
        print(f"Error extracting text from PIL Image: {e}")
        return ""
