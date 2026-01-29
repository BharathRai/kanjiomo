import pdfplumber
import json
import re
import os

# Paths
N5_PDF_PATH = r"C:\Users\ADMIN\Desktop\Copy of N5 漢字教材.pdf"
N4_PDF_PATH = r"C:\Users\ADMIN\Desktop\Copy of N4 漢字教材.pdf"
OUTPUT_PATH = r"C:\Users\ADMIN\Desktop\kanjiomo\public\n5_kanji_data.json"

def clean_text(text):
    if not text: return ""
    return text.strip()

def save_if_safe(kanji_db, kanji_entry):
    """
    Saves the kanji_entry to kanji_db ONLY if it doesn't overwrite an existing N5 entry with an N4 one.
    This prevents N5 'Review' items found in N4 PDF from polluting the N4 level.
    """
    if not kanji_entry:
        return

    char = kanji_entry["character"]
    
    # Check if exists
    if char in kanji_db:
        existing = kanji_db[char]
        # logic: If existing is N5, and new is N4 -> SKIP
        if existing["level"] == "N5" and kanji_entry["level"] == "N4":
            # print(f"Skipping N5 Review Item in N4: {char}")
            return # Do nothing
            
    # Otherwise save/overwrite
    kanji_db[char] = kanji_entry

def extract_kanji_entries():
    kanji_db = {}
    
    # Define tasks: (Path, Level, StartPage)
    tasks = [
        (N5_PDF_PATH, "N5", 5),
        (N4_PDF_PATH, "N4", 6)
    ]

    for pdf_path, level, start_page in tasks:
        if not os.path.exists(pdf_path):
            print(f"Warning: {pdf_path} not found. Skipping.")
            continue
            
        print(f"Extracting Kanji from {pdf_path} ({level})...")
        
        with pdfplumber.open(pdf_path) as pdf:
            for page_idx, page in enumerate(pdf.pages[start_page:], start=start_page+1):
                text = page.extract_text()
                if not text: continue
                
                # Detect Lesson Header
                if level == "N4":
                    lines = text.split('\n')
                    for line in lines:
                        lesson_match = re.search(r'(\d+)\s+(\d+)\s*課', line)
                        if lesson_match:
                            l1, l2 = lesson_match.groups()
                            current_lesson = f"Lessons {l1} & {l2}"
                            # print(f"  [Page {page_idx}] Found Lesson: {current_lesson}")
                else:
                    lines = text.split('\n')
                    for line in lines:
                        lesson_match = re.search(r'(\d+)\s+(\d+)\s*課', line)
                        if lesson_match:
                            current_lesson = line.strip()

                lines = text.split('\n')
                current_kanji = None
                capture_mode = "SEARCH"
                
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    if line == "ー": continue
                    if "Compounds" in line: capture_mode = "EXAMPLES"; continue
                    if "====" in line: continue
                    if "No. Kanji" in line: continue

                    header_match = re.search(r'^(\d+)\s+([\u4e00-\u9faf])\s+(.*)', line)
                    
                    if header_match:
                        # Save Previous (Safe Save)
                        if current_kanji:
                            save_if_safe(kanji_db, current_kanji)
                            
                        # Start New
                        num = header_match.group(1)
                        char = header_match.group(2)
                        rest = header_match.group(3)
                        
                        meaning = "Unknown"
                        readings_str = rest
                        
                        ascii_match = re.search(r'[a-zA-Z]', rest)
                        if ascii_match:
                            idx = ascii_match.start()
                            readings_str = rest[:idx].strip()
                            meaning = rest[idx:].strip()
                        
                        onyomi_list = []
                        kunyomi_list = []
                        
                        raw_readings = re.split(r'[、\s]+', readings_str)
                        for r in raw_readings:
                            if not r: continue
                            if '（' in r or '(' in r:
                                kunyomi_list.append(r)
                            elif len(r) > 0 and not re.match(r'[a-zA-Z]', r):
                                onyomi_list.append(r)
                                
                        current_kanji = {
                            "character": char,
                            "level": level,
                            "lesson": current_lesson if 'current_lesson' in locals() else "Unknown",
                            "pdf_id": num, 
                            "onyomi": onyomi_list,
                            "kunyomi": kunyomi_list,
                            "meaning": meaning,
                            "stroke_count": 0,
                            "examples": []
                        }
                        capture_mode = "EXAMPLES"
                        continue
                    
                    if capture_mode == "EXAMPLES" and current_kanji:
                        if re.match(r'^\d+$', line): continue
                        
                        ex_ascii = re.search(r'[a-zA-Z]', line)
                        if ex_ascii:
                            idx = ex_ascii.start()
                            jp_part = line[:idx].strip()
                            eng_part = line[idx:].strip()
                            
                            jp_parts_split = jp_part.split()
                            if len(jp_parts_split) >= 2:
                                 word = jp_parts_split[0]
                                 reading = " ".join(jp_parts_split[1:])
                                 current_kanji["examples"].append({
                                     "japanese": f"{word} ({reading})",
                                     "romaji": reading,
                                     "english": eng_part
                                 })
                            else:
                                 current_kanji["examples"].append({
                                     "japanese": jp_part,
                                     "romaji": "",
                                     "english": eng_part
                                 })
                
                # End of page loop (Save pending kanji)
                if current_kanji:
                    save_if_safe(kanji_db, current_kanji)

    print(f"Found {len(kanji_db)} unique Kanji headers across all levels.")
    return kanji_db

def extract_sentences(kanji_db):
    print("Skipping sentence extraction from image-based PDF (Kanji-1.pdf)")
    return kanji_db

def main():
    if not os.path.exists(N5_PDF_PATH):
        print(f"Error: File not found {N5_PDF_PATH}")
        return

    kanji_db = extract_kanji_entries()
    kanji_db = extract_sentences(kanji_db)
        
    final_list = list(kanji_db.values())
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully saved {len(final_list)} entries to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
