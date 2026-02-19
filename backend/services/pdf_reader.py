import fitz  # PyMuPDF
from PIL import Image
from services.ocr import extract_text_from_image_object

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF file by converting pages to images using PyMuPDF (fitz).
    This avoids external dependencies like Poppler.
    """
    text = ""
    try:
        # Open the PDF
        doc = fitz.open(file_path)
        
        for i, page in enumerate(doc):
            if i >= 2:
                break
            # Render page to a pixmap (image)
            pix = page.get_pixmap()
            
            # Convert pixmap to PIL Image
            # pix.samples contains the raw RGB image data
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Extract text from the page image
            page_text = extract_text_from_image_object(img)
            text += f"--- Page {i+1} ---\n{page_text}\n"
            
        doc.close()
            
    except Exception as e:
        print(f"Error reading PDF via PyMuPDF {file_path}: {e}")
    
    return text
