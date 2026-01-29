import json
import os

JSON_PATH = r"C:\Users\ADMIN\Desktop\kanjiomo\public\n5_kanji_data.json"

# User provided mapping
# Format: "Characters": "Lesson Name"
# We will invert this to Char -> Lesson
MANUAL_MAPPING = {
    "Numbers": "一二三四五六七八九十",
    "Lessons 1 & 2": "人名方本日何大学社員会先生行来車",
    "Lessons 3 & 4": "百千万円毎時分半国月火水木金土書",
    "Lessons 5 & 6": "友年今週休前午後校帰見聞読食飲買",
    "Lessons 7 & 8": "母父物朝昼夜晩町山白赤青黒安高小",
    "Lessons 9 & 10": "男女上下左右中門間近魚手犬早計外",
    "Lessons 11 & 12": "兄弟姉妹家族春夏秋冬気天多少元歩",
    "Lessons 13 & 14": "入出広止雨開海川世界画映花茶語英",
    "Lessons 15 & 16": "体足口顔耳目立知住思使作品長明肉",
    "Lessons 17 & 18": "問答心配子売場字漢料理主着新古持",
    "Lessons 19 & 20": "電話音楽歌度教習貸借送強勉旅室登",
    "Lessons 21 & 22": "不始言意事仕病院医者堂屋用有店民",
    "Lessons 23 & 24": "正銀図館道自動建特終駅写真牛林森",
    "Lesson 25": "田考親切試験部文歳留議散浴降欲億",
}

def patch_lessons():
    if not os.path.exists(JSON_PATH):
        print("JSON not found")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Build Char Map
    char_to_lesson = {}
    for lesson_name, chars in MANUAL_MAPPING.items():
        # Clean chars just in case (remove spaces/commas if any, though string looks clean)
        clean_chars = chars.replace(",","").replace(" ","")
        for c in clean_chars:
            char_to_lesson[c] = lesson_name

    updated_count = 0
    n4_count = 0
    
    for entry in data:
        char = entry["character"]
        level = entry.get("level", "N5")
        
        # Apply Patch to N5 Only? Or if char matches?
        # User said "kanjis from each level... this is only n5"
        # So we prioritise this map for N5.
        
        if char in char_to_lesson:
            entry["lesson"] = char_to_lesson[char]
            # Force level N5 if it was ambiguous?
            entry["level"] = "N5" 
            updated_count += 1
        elif level == "N4":
            n4_count += 1
            
    print(f"Patched {updated_count} N5 entries.")
    print(f"Found {n4_count} N4 entries remaining.")

    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    patch_lessons()
