import pdfplumber
import json
import re

PDF_PATH = r"C:\Users\ADMIN\Desktop\Copy of N5 漢字教材.pdf"
OUTPUT_PATH = r"C:\Users\ADMIN\Desktop\kanjiomo\public\n5_kanji_data.json"

def extract_kanji_data():
    kanji_list = []
    
    try:
        with pdfplumber.open(PDF_PATH) as pdf:
            print(f"Opened PDF with {len(pdf.pages)} pages")
            
            # This is a heuristic based on typical N5 Kanji PDF layouts
            # We look for large characters or structured tables.
            
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    continue
                    
                # Simple extraction logic: find single Kanji characters that are likely headers
                # or parsed within a specific pattern.
                # Since I cannot see the PDF structure visually, I will assume a standard list format.
                # Adjust regex as needed after inspection.
                
                # Looking for standard Kanji unicode range
                # \u4e00-\u9faf is the main Kanji block
                
                lines = text.split('\n')
                for line in lines:
                    # Example heuristic: Line contains a Kanji, and maybe reading/meaning
                    # This is highly dependent on formatting.
                    
                    # For now, I'll extract EVERY unique Kanji found in the document 
                    # that appears to be a "main" entry.
                    
                    # Placeholder logic: Find lines with 1 Kanji and English text
                    matches = re.finditer(r'([\u4e00-\u9faf])', line)
                    for match in matches:
                        char = match.group(1)
                        if char not in [k['character'] for k in kanji_list]:
                             kanji_list.append({
                                "character": char,
                                "onyomi": [], # To be filled
                                "kunyomi": [], # To be filled
                                "meaning": "Unknown", # To be filled
                                "stroke_count": 0
                            })
                            
        print(f"Extracted {len(kanji_list)} potential Kanji entries.")
        
        # Save to JSON
        with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(kanji_list, f, ensure_ascii=False, indent=2)
            
        print(f"Saved data to {OUTPUT_PATH}")
        
    except Exception as e:
        print(f"Error extracting data: {e}")

if __name__ == "__main__":
    extract_kanji_data()
