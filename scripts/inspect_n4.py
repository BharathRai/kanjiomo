import json
import os

JSON_PATH = r"C:\Users\ADMIN\Desktop\kanjiomo\public\n5_kanji_data.json"

def inspect_n4():
    if not os.path.exists(JSON_PATH):
        print("JSON not found")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    n4_items = [d for d in data if d.get("level") == "N4"]
    print(f"Total N4 Items: {len(n4_items)}")
    
    if not n4_items:
        print("No N4 items found!")
        return

    # Check Lessons
    lessons = {}
    for item in n4_items:
        l = item.get("lesson", "Missing")
        lessons[l] = lessons.get(l, 0) + 1
        
    print("\nN4 Lesson Distribution:")
    for l, count in lessons.items():
        print(f"  '{l}': {count}")

    # Sample Item
    print("\nSample N4 Item:")
    print(json.dumps(n4_items[0], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    inspect_n4()
