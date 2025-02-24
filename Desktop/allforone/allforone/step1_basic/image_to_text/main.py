import os
import pytesseract
import subprocess
from PIL import Image
import re

# Tesseract のパス
tesseract_cmd = "/opt/homebrew/bin/tesseract"

# ImageMagick の `magick` コマンドパス
imagemagick_cmd = "/opt/homebrew/bin/magick"

# 入力 & 出力ディレクトリ
input_dir = "data"
output_dir = "results"
os.makedirs(output_dir, exist_ok=True)

# OCR 対象の画像形式
supported_formats = (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".gif")

# 画像前処理（デバッグ用に詳細なログ追加）
def preprocess_image(input_path, output_path):
    print(f"🛠 画像前処理開始: {input_path} → {output_path}")

    try:
        subprocess.run([
            imagemagick_cmd, "convert", input_path, 
            "-resize", "200%",  # 拡大倍率を 200% に
            "-colorspace", "Gray",  # グレースケール変換
            "-contrast-stretch", "5x95%",  # コントラストをやや強調
            output_path
        ], check=True)

        print(f"✅ 画像前処理完了: {output_path}")
        return output_path

    except subprocess.CalledProcessError as e:
        print(f"❌ ImageMagick の処理中にエラーが発生しました: {e}")
        return None

# OCR 実行（詳細なデバッグ情報を追加）
def run_ocr(image_path):
    print(f"📝 OCR実行: {image_path}")

    command = [tesseract_cmd, image_path, "stdout", "-l", "eng", "--psm", "6", "--oem", "3"]
    try:
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        print(f"✅ Tesseract OCR出力（{len(result.stdout)} 文字）:\n{result.stdout}\n")
        if result.stderr:
            print(f"⚠️ Tesseract エラーメッセージ:\n{result.stderr}")

        return result.stdout

    except subprocess.CalledProcessError as e:
        print(f"❌ Tesseract の実行中にエラーが発生しました: {e}")
        print(f"⚠️ Tesseract エラーメッセージ:\n{e.stderr}")
        return ""

# OCR 結果の後処理
def clean_text(text):
    """OCR結果をクリーンアップする関数"""
    # **1. 不要な特殊文字を削除**
    text = re.sub(r'[^a-zA-Z0-9\s\.,\-@:/\(\)⭐]+', '', text)  # 基本的な不要文字削除
    
    # **2. ノイズフレーズを削除**
    noise_words = [
        "Q Type", "to search", "FH vy ⭐s", "Find repository...",
        "Type Language Sort", "ERE OS", "BX following"
    ]
    text = re.sub(r'\b(' + '|'.join(map(re.escape, noise_words)) + r')\b', '', text)

    # **3. 空白調整 & 改行の正規化**
    text = re.sub(r'\s+', ' ', text).strip()

    return text

# OCR を実行
for filename in os.listdir(input_dir):
    file_path = os.path.join(input_dir, filename)

    if not filename.lower().endswith(supported_formats):
        print(f"⚠️ スキップ: {filename}（対応していない形式）")
        continue

    try:
        # 画像の前処理
        preprocessed_path = os.path.join(output_dir, f"preprocessed_{filename}")
        preprocessed_file = preprocess_image(file_path, preprocessed_path)

        if preprocessed_file is None:
            print(f"❌ {filename} の前処理に失敗したためスキップ")
            continue

        # **OCR 実行**
        text = run_ocr(preprocessed_file)

        if len(text.strip()) == 0:
            print(f"⚠️ {filename} のOCR出力が空！前処理を見直してください。")
            continue

        # **OCR後処理**
        text_cleaned = clean_text(text)

        # **OCR結果を保存**
        output_filename = os.path.splitext(filename)[0] + ".txt"
        output_path = os.path.join(output_dir, output_filename)

        with open(output_path, "w") as f:
            f.write(text_cleaned)

        # **OCRの生データも保存**
        ocr_raw_path = os.path.join(output_dir, f"raw_{output_filename}")
        with open(ocr_raw_path, "w") as f:
            f.write(text)

        print(f"✅ OCR完了: {filename} → {output_filename}")
        print(f"📝 OCR生データも {ocr_raw_path} に保存しました")

    except Exception as e:
        print(f"❌ エラー: {filename} の処理中に問題が発生しました: {e}")

print("🎉 すべての画像のOCR処理が完了しました！")
