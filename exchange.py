from fugashi import Tagger
import csv

# カタカナをひらがなに変換する関数
def katakana_to_hiragana(text):
    return ''.join(
        chr(ord(char) - 0x60) if 'ァ' <= char <= 'ン' else char
        for char in text
    )

tagger = Tagger()

with open("machi.csv", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)
    rows = list(reader)

output = []
header.append("ふりがな")  # 新しい列を追加

for row in rows:
    name = row[2]  # 自治体名等
    reading = "".join([
        word.feature.kana or word.surface
        for word in tagger(name)
    ])
    reading_hiragana = katakana_to_hiragana(reading)
    row.append(reading_hiragana)
    output.append(row)

with open("machi_with_furigana.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(output)

print("✅ 出力完了: machi_with_furigana.csv（ひらがな）")
