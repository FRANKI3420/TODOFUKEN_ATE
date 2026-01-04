import pandas as pd

def add_accurate_furigana(input_csv_path, output_csv_path, master_csv_path):
    print("マスターデータを読み込み中...")
    # Shift-JISで読み込み
    master = pd.read_csv(master_csv_path, encoding='shift_jis', header=None, dtype=str)
    
    # 6:都道府県名, 7:市区町村名, 4:フリガナ
    master_map = master[[6, 7, 4]].copy()
    master_map.columns = ['都道', '市区町村フル', 'フリガナ']
    
    # 【重要】マスター側の「安芸郡府中町」から「府中町」だけを抽出する処理
    # 郡名の後に続く自治体名を特定（「郡」の後の文字を取得）
    def extract_town(s):
        if '郡' in s:
            return s.split('郡')[-1]
        return s
    
    master_map['自治体名等'] = master_map['市区町村フル'].apply(extract_town)
    
    # 必要な列だけに絞って重複削除
    master_map = master_map[['都道', '自治体名等', 'フリガナ']].drop_duplicates()

    print(f"{input_csv_path} を処理中...")
    user_df = pd.read_csv(input_csv_path)

    # ユーザー側の既存の空のフリガナ列を一旦削除
    if 'フリガナ' in user_df.columns:
        user_df = user_df.drop(columns=['フリガナ'])

    # 空白クリーニング
    user_df['都道'] = user_df['都道'].str.strip()
    user_df['自治体名等'] = user_df['自治体名等'].str.strip()
    
    # 照合
    result_df = pd.merge(user_df, master_map, on=['都道', '自治体名等'], how='left')

    # 重複削除
    if 'No' in result_df.columns:
        result_df = result_df.drop_duplicates(subset=['No'])

    # 保存（Excel対応のUTF-8-SIG）
    result_df.to_csv(output_csv_path, index=False, encoding="utf-8-sig")
    print(f"完了しました！「{output_csv_path}」にフリガナが入っているか確認してください。")

if __name__ == "__main__":
    add_accurate_furigana('machi.csv', 'machi_fixed.csv', 'KEN_ALL.CSV')