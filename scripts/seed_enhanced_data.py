import json
import os

JSON_PATH = r"C:\Users\ADMIN\Desktop\kanjiomo\public\n5_kanji_data.json"

# Radical Dictionary: Char -> "Reading (Meaning)"
# This ensures we display "木 (ki - Tree)" instead of just "木"
RADICAL_DICT = {
    "一": "いち (One)", "丨": "ぼう (Line)", "丶": "てん (Dot)", "丿": "の (Slide)", "乙": "おつ (Second)", "亅": "はねぼう (Hook)",
    "二": "に (Two)", "亠": "なべぶた (Lid)", "人": "ひと (Person)", "亻": "にんべん (Person)", "儿": "ひとあし (Legs)",
    "入": "いる (Enter)", "八": "はち (Eight)", "冂": "けいがまえ (Box)", "冖": "わかんむり (Crown)", "冫": "にすい (Ice)",
    "几": "つくえ (Desk)", "凵": "うけばこ (Container)", "刀": "かたな (Sword)", "刂": "りっとう (Sword)", "力": "ちから (Power)",
    "勹": "つつみがまえ (Wrap)", "匕": "さじ (Spoon)", "匚": "はこがまえ (Box)", "十": "じゅう (Ten)", "卜": "ぼく (Divination)",
    "卩": "ふしづくり (Seal)", "厂": "がんだれ (Cliff)", "ム": "む (Private)", "又": "また (Again)",
    "口": "くち (Mouth)", "囗": "くにがまえ (Enclosure)", "土": "つち (Earth)", "士": "さむらい (Warrior)", "夂": "ふゆがしら (Winter)",
    "夕": "ゆうべ (Evening)", "大": "だい (Big)", "女": "おんな (Woman)", "子": "こ (Child)", "宀": "うかんむり (Roof)",
    "寸": "すん (Inch)", "小": "ちいさい (Small)", "尢": "だいのまげあし (Lame)", "尸": "しかばね (Corpse)", "屮": "てつ (Sprout)",
    "山": "やま (Mountain)", "川": "かわ (River)", "工": "たくみ (Work)", "己": "おのれ (Self)", "巾": "はば (Towel)",
    "干": "ほす (Dry)", "幺": "いとがしら (Thread)", "广": "まだれ (Cliff)", "廴": "えんにょう (Stretch)", "廾": "にじゅうあし (Hands)",
    "弋": "しきがまえ (Ceremony)", "弓": "ゆみ (Bow)", "ヨ": "けいがしら (Snout)", "彡": "さんづくり (Hair)", "彳": "ぎょうにんべん (Step)",
    "心": "こころ (Heart)", "忄": "りっしんべん (Heart)", "戈": "ほこ (Spear)", "戸": "と (Door)", "手": "て (Hand)", "扌": "てへん (Hand)",
    "支": "しにょう (Branch)", "攴": "ぼくづくり (Hit)", "文": "ぶん (Literature)", "斗": "とます (Dipper)", "斤": "おの (Axe)",
    "方": "ほう (Square/Dir)", "无": "むにょう (None)", "日": "ひ (Sun)", "曰": "ひらび (Say)", "月": "つき (Moon)",
    "木": "き (Tree)", "欠": "あくび (Yawn)", "止": "とめる (Stop)", "歹": "がつへん (Death)", "殳": "ほこづくり (Weapon)",
    "毋": "なかれ (Do not)", "比": "くらべる (Compare)", "毛": "け (Fur)", "氏": "うじ (Clan)", "气": "きがまえ (Steam)",
    "水": "みず (Water)", "氵": "さんずい (Water)", "火": "ひ (Fire)", "灬": "れっか (Fire)", "爪": "つめ (Claw)",
    "父": "ちち (Father)", "爻": "こう (Mix)", "爿": "しょう (Split wood)", "片": "かた (Slice)", "牙": "きば (Fang)",
    "牛": "うし (Cow)", "犬": "いぬ (Dog)", "犭": "けものへん (Beast)", "玄": "げん (Dark)", "玉": "たま (Jewel)",
    "王": "おう (King)", "瓜": "うり (Melon)", "瓦": "かわら (Tile)", "甘": "あまい (Sweet)", "生": "うまれる (Life)",
    "用": "もちいる (Use)", "田": "た (Field)", "疋": "ひき (Cloth)", "疒": "やまいだれ (Sickness)", "癶": "はつがしら (Tent)",
    "白": "しろ (White)", "皮": "かわ (Skin)", "皿": "さら (Dish)", "目": "め (Eye)", "矛": "ほこ (Spear)",
    "矢": "や (Arrow)", "石": "いし (Stone)", "示": "しめす (Show)", "礻": "しめすへん (Show)", "禸": "ぐうのあし (Track)",
    "禾": "のぎへん (Grain)", "穴": "あな (Hole)", "立": "たつ (Stand)", "竹": "たけ (Bamboo)", "米": "こめ (Rice)",
    "糸": "いと (Thread)", "缶": "ほとぎ (Can)", "网": "あみがしら (Net)", "羊": "ひつじ (Sheep)", "羽": "はね (Feather)",
    "老": "おい (Old)", "而": "しかして (And)", "耒": "らいすき (Plow)", "耳": "みみ (Ear)", "聿": "ふでづくり (Brush)",
    "肉": "にく (Meat)", "臣": "しん (Minister)", "自": "みずから (Self)", "至": "いたる (Arrive)", "臼": "うす (Mortar)",
    "舌": "した (Tongue)", "舛": "ます (Dance)", "舟": "ふね (Boat)", "艮": "うしとら (Good)", "色": "いろ (Color)",
    "艹": "くさかんむり (Grass)", "虍": "とらがしら (Tiger)", "虫": "むし (Insect)", "血": "ち (Blood)", "行": "ゆき (Go)",
    "衣": "ころも (Clothes)", "衤": "ころもへん (Clothes)", "襾": "にし (West)", "見": "みる (See)", "角": "つの (Horn)",
    "言": "こと (Word)", "谷": "たに (Valley)", "豆": "まめ (Bean)", "豕": "いのこ (Pig)", "豸": "むじな (Badger)",
    "貝": "かい (Shell)", "赤": "あか (Red)", "走": "はしる (Run)", "足": "あし (Foot)", "身": "み (Body)",
    "車": "くるま (Car)", "辛": "からい (Spicy)", "辰": "しん (Dragon)", "辵": "しんにょう (Walk)", "辶": "しんにょう (Walk)",
    "邑": "むら (Village)", "酉": "とり (Bird/Sake)", "釆": "のごめ (Dice)", "里": "さと (Village)",
    "金": "かね (Gold)", "長": "ながい (Long)", "門": "もん (Gate)", "阜": "おか (Mound)", "阝": "こざとへん (Mound/Town)",
    "隶": "れいづくり (Slave)", "隹": "ふるとり (Old bird)", "雨": "あめ (Rain)", "青": "あお (Blue)", "非": "あらず (Wrong)",
    "面": "めん (Face)", "革": "かわ (Leather)", "韋": "なめしがわ (Leather)", "音": "おと (Sound)", "頁": "おおがい (Page)",
    "風": "かぜ (Wind)", "飛": "とぶ (Fly)", "食": "しょく (Eat)", "首": "くび (Neck)", "香": "かおり (Scent)",
    "馬": "うま (Horse)", "骨": "ほね (Bone)", "高": "たかい (High)", "髟": "かみがしら (Hair)", "鬥": "とうがまえ (Fight)",
    "鬯": "ちょう (Herb)", "鬲": "れき (Cauldron)", "鬼": "おに (Demon)", "魚": "さかな (Fish)", "鳥": "とり (Bird)",
    "鹵": "ろ (Salt)", "鹿": "しか (Deer)", "麻": "あさ (Hemp)", "黄": "き (Yellow)", "黍": "きび (Millet)",
    "黒": "くろ (Black)", "黹": "ぬいとり (Embroider)",
}

# Mapping Kanji -> [Radical1, Radical2...]
# Extending the previous map
N5_RADICAL_MAP = {
    "一": ["一"],
    "二": ["一", "一"],
    "三": ["一", "二"],
    "四": ["囗", "儿"],
    "五": ["二", "X"],  # X is placeholder
    "六": ["亠", "八"],
    "七": ["一", "乚"],
    "八": ["八"],
    "九": ["丿", "乙"],
    "十": ["一", "丨"],
    "人": ["人"], "名": ["夕", "口"], "方": ["方"], "本": ["木", "一"], "日": ["日"],
    "何": ["人", "可"], "大": ["大"], "学": ["ツ", "冖", "子"], "社": ["礻", "土"], "員": ["口", "貝"],
    "会": ["人", "二", "ム"], "先": ["牛", "儿"], "生": ["生"], "行": ["彳", "亍"], "来": ["木", "米"],
    "車": ["車"], "百": ["一", "白"], "千": ["十", "丿"], "万": ["一", "刀"], "円": ["冂", "丄"],
    "毎": ["毋", "人"], "時": ["日", "寺"], "分": ["八", "刀"], "半": ["丶", "二", "丨"], "国": ["囗", "玉"],
    "月": ["月"], "火": ["火"], "水": ["水"], "木": ["木"], "金": ["人", "王", "丷"], "土": ["土"],
    "書": ["聿", "日"], "友": ["十", "又"], "年": ["人", "干"], "今": ["人", "ラ"], "週": ["辶", "周"],
    "休": ["人", "木"], "前": ["艹", "月", "刂"], "午": ["牛"], "後": ["彳", "幺", "夂"], "校": ["木", "交"],
    "帰": ["刂", "ヨ", "巾"], "見": ["目", "儿"], "聞": ["門", "耳"], "読": ["言", "売"], "食": ["人", "良"],
    "飲": ["食", "欠"], "買": ["罒", "貝"], "母": ["母"], "父": ["父"], "物": ["牛", "勿"],
    "朝": ["十", "日", "十", "月"], "昼": ["尺", "日"], "夜": ["亠", "人", "夕", "乀"], "晩": ["日", "免"],
    "町": ["田", "丁"], "山": ["山"], "白": ["白"], "赤": ["土", "八", "小"], "青": ["主", "月"],
    "黒": ["里", "灬"], "安": ["宀", "女"], "高": ["高"], "小": ["小"], "男": ["田", "力"],
    "女": ["女"], "上": ["上"], "下": ["下"], "左": ["ナ", "工"], "右": ["ナ", "口"], "中": ["中"],
    # Add some N4 examples
    "紙": ["糸", "氏"], "県": ["目", "小"], "都": ["者", "阝"], "合": ["人", "一", "口"], "速": ["辶", "束"],
    "直": ["十", "目", "乚"], "業": ["业", "未"], "鳥": ["鳥"], "通": ["辶", "用"], "味": ["口", "未"],
    "運": ["辶", "軍"], "転": ["車", "云"], "力": ["力"], "色": ["色"],
}

def seed_enhanced_radicals():
    if not os.path.exists(JSON_PATH):
        print("JSON not found")
        return

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    updated_count = 0
    for entry in data:
        char = entry["character"]
        
        parts_list = []
        
        if char in N5_RADICAL_MAP:
            # We have an explicit map
            raw_parts = N5_RADICAL_MAP[char]
            
            # Convert to Rich Objects: { part: "木", meaning: "き (Tree)" }
            # Wait, the frontend component expects:
            # parts: string[] | { part: string; meaning: string }[]
            # So let's store rich objects in the JSON!
            
            for p in raw_parts:
                if p in RADICAL_DICT:
                    # RADICAL_DICT[p] is like "き (Tree)"
                    # We can split it if we want rigorous data, but for now just pass as meaning
                    full_meaning_reading = RADICAL_DICT[p]
                    parts_list.append({
                        "part": p,
                        "meaning": full_meaning_reading
                    })
                else:
                    parts_list.append({
                        "part": p,
                        "meaning": "?"
                    })
                    
            entry["parts"] = parts_list
            
            # Update Story
            meaning = entry["meaning"].split(',')[0]
            if len(raw_parts) >= 2:
                # Use reading/meaning in story? Maybe too long. Just use char.
                entry["story"] = f"Picture {raw_parts[0]} and {raw_parts[1]} combining to form '{meaning}'."
            elif len(raw_parts) == 1:
                entry["story"] = f"The radical {raw_parts[0]} is the core essence of '{meaning}'."
                
            updated_count += 1
            
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Enhanced radicals for {updated_count} Kanji.")

if __name__ == "__main__":
    seed_enhanced_radicals()
