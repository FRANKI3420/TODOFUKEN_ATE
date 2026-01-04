import pandas as pd
import re

def hira_convert_zenkaku(text):
    """半角カタカナを全角カタカナへ変換（標準機能のみ）"""
    if not isinstance(text, str): return text
    daku_map = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ'
    }
    kana_map = {
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ'
    }
    res = text
    for k, v in daku_map.items():
        res = res.replace(k, v)
    for k, v in kana_map.items():
        res = res.replace(k, v)
    return res

def normalize_key(text):
    """照合用のキー作成（都道府・郡を除去して完全一致を目指す）"""
    if not isinstance(text, str): return ""
    text = text.replace(' ', '').replace('　', '').strip()
    # 都道府県の末尾（都・道・府・県）を削除
    text = re.sub(r'(都|道|府|県)$', '', text)
    # 自治体名から郡名を削除
    if '郡' in text:
        text = text.split('郡')[-1]
    return text

def finalize_machi_csv(input_csv_path, master_csv_path, output_csv_path):
    print("マスターデータを読み込み、解析中...")
    # dtype=str で読み込み、勝手な型変換を防止
    master = pd.read_csv(master_csv_path, dtype=str)
    
    m_dict = {}
    for _, row in master.iterrows():
        p_key = normalize_key(row['都道'])
        c_key = normalize_key(row['自治体名等'])
        
        # フリガナの整形：『ｸﾞﾝ』があればその後ろを抽出
        raw_kana = row['フリガナ']
        if 'ｸﾞﾝ' in raw_kana:
            kana = raw_kana.split('ｸﾞﾝ')[-1]
        else:
            kana = raw_kana
        
        # 全角カタカナに変換（アミマチ等）
        m_dict[(p_key, c_key)] = hira_convert_zenkaku(kana)

    print(f"{input_csv_path} を読み込み、フリガナを付与しています...")
    user_df = pd.read_csv(input_csv_path, dtype=str)
    
    # 既存のフリガナ列があれば一旦削除
    if 'フリガナ' in user_df.columns:
        user_df = user_df.drop(columns=['フリガナ'])

    # 照合ロジック
    def match_furigana(row):
        p = normalize_key(row['都道'])
        c = normalize_key(row['自治体名等'])
        return m_dict.get((p, c), "")

    user_df['フリガナ'] = user_df.apply(match_furigana, axis=1)

    # 保存（Excel対応のUTF-8-SIG）
    user_df.to_csv(output_csv_path, index=False, encoding="utf-8-sig")
    
    # 完了後の確認表示
    print(f"\n完了！「{output_csv_path}」を作成しました。")
    print("--- 処理結果（先頭5件） ---")
    print(user_df.head())

if __name__ == "__main__":
    finalize_machi_csv('mura.csv', 'master_clean.csv', 'mura_fixed.csv')