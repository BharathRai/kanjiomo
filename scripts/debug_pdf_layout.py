import pdfplumber
import os

N5_PDF_PATH = r"C:\Users\ADMIN\Desktop\Copy of N5 漢字教材.pdf"
N4_PDF_PATH = r"C:\Users\ADMIN\Desktop\Copy of N4 漢字教材.pdf"
DEBUG_OUTPUT = r"C:\Users\ADMIN\Desktop\kanjiomo\pdf_debug_dump_n4.txt"

def dump_first_pages(pdf_path, label):
    text_content = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_content += f"--- {label} (Pages 6-20) ---\n"
            for i, page in enumerate(pdf.pages[5:20]):
                text_content += f"\n[Page {i+1}]\n"
                text_content += page.extract_text() or "[NO TEXT EXTRACTED]"
                text_content += "\n" + "="*50 + "\n"
    except Exception as e:
        text_content += f"Error opening {label}: {e}\n"
    return text_content

def main():
    report = ""
    report += dump_first_pages(N4_PDF_PATH, "N4 Kanji PDF")
    
    with open(DEBUG_OUTPUT, "w", encoding="utf-8") as f:
        f.write(report)
    
    print(f"Dumped text to {DEBUG_OUTPUT}")

if __name__ == "__main__":
    main()
