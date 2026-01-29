import json
import os

JSON_PATH = r"C:\Users\ADMIN\Desktop\kanjiomo\public\n5_kanji_data.json"

# Manually curated list of N5 Kanji parts to ensure the feature works for demo
# Format: "Kanji": ["Part1", "Part2", "Part3"...]
N5_RADICAL_MAP = {
    "一": ["一"],
    "二": ["一", "一"],
    "三": ["一", "二"],
    "四": ["囗", "儿"],
    "五": ["二", "X"], 
    "六": ["亠", "八"],
    "七": ["一", "乚"],
    "八": ["八"],
    "九": ["丿", "乙"],
    "十": ["一", "丨"],
    "人": ["人"],
    "名": ["夕", "口"],
    "方": ["方"],
    "本": ["木", "一"],
    "日": ["日"],
    "何": ["人", "可"],
    "大": ["大"],
    "学": ["ツ", "冖", "子"],
    "社": ["礻", "土"],
    "員": ["口", "貝"],
    "会": ["人", "二", "ム"],
    "先": ["牛", "儿"],
    "生": ["生"],
    "行": ["彳", "亍"],
    "来": ["木", "米"], 
    "車": ["車"],
    "百": ["一", "白"],
    "千": ["十", "丿"],
    "万": ["一", "刀"],
    "円": ["冂", "丄"],
    "毎": ["毋", "人"],
    "時": ["日", "寺"],
    "分": ["八", "刀"],
    "半": ["丶", "二", "丨"],
    "国": ["囗", "玉"],
    "月": ["月"],
    "火": ["火"],
    "水": ["水"],
    "木": ["木"],
    "金": ["人", "王", "丷"],
    "土": ["土"],
    "書": ["聿", "日"],
    "友": ["十", "又"],
    "年": ["人", "干"],
    "今": ["人", "ラ"],
    "週": ["辶", "周"],
    "休": ["人", "木"],
    "前": ["艹", "月", "刂"],
    "午": ["牛"],
    "後": ["彳", "幺", "夂"],
    "校": ["木", "交"],
    "帰": ["刂", "ヨ", "巾"],
    "見": ["目", "儿"],
    "聞": ["門", "耳"],
    "読": ["言", "売"],
    "食": ["人", "良"],
    "飲": ["食", "欠"],
    "買": ["罒", "貝"],
    "母": ["母"],
    "父": ["父"],
    "物": ["牛", "勿"],
    "朝": ["十", "日", "十", "月"],
    "昼": ["尺", "日"],
    "夜": ["亠", "人", "夕", "乀"],
    "晩": ["日", "免"],
    "町": ["田", "丁"],
    "山": ["山"],
    "白": ["白"],
    "赤": ["土", "八", "小"], # Approximate
    "青": ["主", "月"],
    "黒": ["里", "灬"],
    "安": ["宀", "女"],
    "高": ["高"],
    "小": ["小"],
    "男": ["田", "力"],
    "女": ["女"],
    "上": ["上"],
    "下": ["下"],
    "左": ["ナ", "工"],
    "右": ["ナ", "口"],
    "中": ["中"],
    # Add more as needed or use "Meaning" as parts fallback
}

def seed_radicals():
    if not os.path.exists(JSON_PATH):
        print("JSON not found")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    updated_count = 0
    for entry in data:
        char = entry["character"]
        if char in N5_RADICAL_MAP:
            entry["parts"] = N5_RADICAL_MAP[char]
            
            # Generate Basic Story
            parts = N5_RADICAL_MAP[char]
            meaning = entry["meaning"].split(',')[0] # First meaning
            if len(parts) >= 2:
                entry["story"] = f"Picture a {parts[0]} meeting a {parts[1]} to create the concept of '{meaning}'."
            elif len(parts) == 1:
                entry["story"] = f"The radical {parts[0]} itself represents the core concept of '{meaning}'."
            updated_count += 1
        else:
            # Fallback for empty parts
            pass
            
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Seeded radicals for {updated_count} Kanji.")

if __name__ == "__main__":
    seed_radicals()
