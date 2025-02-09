import csv
import io
import json
import os
import sqlite3
import logging

import openai
from dotenv import load_dotenv  # 追加
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

# ログ設定
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)

# 環境変数を読み込む
load_dotenv()

# OpenAI API キーを設定
openai.api_key = os.getenv("OPENAI_API_KEY")

if not openai.api_key:
    raise ValueError(
        "OpenAI APIキーが設定されていません。`.env` ファイルを確認してください。"
    )


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask API is running"}), 200


# SQLite データベースの初期化
def init_db():
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()

    cursor.execute(
        """CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tag TEXT DEFAULT '未分類',
            type TEXT DEFAULT 'normal',  
            promptTarget TEXT DEFAULT '', 
            ai_history TEXT DEFAULT '[]'  -- 🔥 JSON型の履歴フィールドを追加
        )"""
    )
    conn.commit()
    conn.close()


init_db()


@app.route("/api/notes", methods=["GET", "POST"])
def api_notes():
    """GET: すべてのノートを取得, POST: 新しいノートを追加"""
    if request.method == "GET":
        return jsonify(get_all_notes()), 200

    elif request.method == "POST":
        data = request.json
        title = data.get("title")
        content = data.get("content")
        tag = data.get("tag", "未分類")
        note_type = data.get("type", "normal")
        prompt_target = data.get("promptTarget", "")

        if not title or not content:
            return jsonify({"error": "タイトルと内容は必須です"}), 400

        conn = sqlite3.connect("notes.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notes (title, content, tag, type, promptTarget) VALUES (?, ?, ?, ?, ?)",
            (title, content, tag, note_type, prompt_target),
        )
        conn.commit()
        note_id = cursor.lastrowid
        conn.close()

        return (
            jsonify(
                {
                    "message": "ノートが追加されました",
                    "note_id": note_id,
                    "notes": get_all_notes(),
                }
            ),
            201,
        )


@app.route("/add_note", methods=["POST"])
def add_note():
    """新しいノートを追加"""
    data = request.json
    title = data.get("title")
    content = data.get("content")
    tag = data.get("tag", "未分類")
    note_type = data.get("type", "normal")
    prompt_target = data.get("promptTarget", "")

    if not title or not content:
        return jsonify({"error": "タイトルと内容は必須です"}), 400

    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO notes (title, content, tag, type, promptTarget) VALUES (?, ?, ?, ?, ?)",
        (title, content, tag, note_type, prompt_target),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "ノートが追加されました", "notes": get_all_notes()}), 201


@app.route("/get_notes", methods=["GET"])
def get_notes():
    """すべてのノートを取得"""
    return jsonify(get_all_notes())


@app.route("/delete_note/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    """ノートを削除"""
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "ノートを削除しました", "notes": get_all_notes()}), 200


@app.route("/update_note/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    """ノートを更新"""
    data = request.json
    title = data.get("title")
    content = data.get("content")
    tag = data.get("tag", "未分類")
    note_type = data.get("type", "normal")
    prompt_target = data.get("promptTarget", "")

    if not title or not content:
        return jsonify({"error": "タイトルと内容は必須です"}), 400

    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE notes SET title = ?, content = ?, tag = ?, type = ?, promptTarget = ? WHERE id = ?",
        (title, content, tag, note_type, prompt_target, note_id),
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "ノートが更新されました", "notes": get_all_notes()}), 200


@app.route("/search_notes", methods=["GET"])
def search_notes():
    """ノートを検索"""
    query = request.args.get("q", "").strip().lower()
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM notes WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(tag) LIKE ?",
        (f"%{query}%", f"%{query}%", f"%{query}%"),
    )
    notes = [
        {
            "id": row[0],
            "title": row[1],
            "content": row[2],
            "tag": row[3],
            "type": row[4],
            "promptTarget": row[5],
        }
        for row in cursor.fetchall()
    ]
    conn.close()
    return jsonify(notes)


@app.route("/export_csv", methods=["GET"])
def export_csv():
    """ノートをCSVファイルとしてエクスポート"""
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, tag, type, promptTarget FROM notes")

    output = io.StringIO()
    writer = csv.writer(output)

    # CSVのヘッダー
    writer.writerow(
        ["ID", "タイトル", "内容", "タグ", "タイプ", "プロンプトターゲット"]
    )

    # データを追加
    for row in cursor.fetchall():
        writer.writerow(row)

    conn.close()

    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=notes.csv"

    return response


@app.route("/export_json", methods=["GET"])
def export_json():
    """ノートをJSONファイルとしてエクスポート"""
    return jsonify(get_all_notes()), 200


@app.route("/import_json", methods=["POST"])
def import_json():
    """JSONファイルをインポートしてノートを追加"""
    try:
        data = request.get_json()

        # 送信されたデータが配列であることを確認
        if not isinstance(data, list):
            return jsonify({"error": "JSONデータはリスト形式である必要があります"}), 400

        conn = sqlite3.connect("notes.db")
        cursor = conn.cursor()

        for note in data:
            cursor.execute(
                "INSERT INTO notes (title, content, tag, type, promptTarget) VALUES (?, ?, ?, ?, ?)",
                (
                    note.get("title", ""),
                    note.get("content", ""),
                    note.get("tag", "未分類"),
                    note.get("type", "normal"),
                    note.get("promptTarget", ""),
                ),
            )

        conn.commit()
        conn.close()

        return (
            jsonify({"message": "ノートが復元されました", "notes": get_all_notes()}),
            201,
        )

    except Exception as e:
        return jsonify({"error": f"JSONの解析エラー: {str(e)}"}), 400


def get_all_notes():
    """データベースから全ノートを取得するヘルパー関数"""
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, title, content, tag, type, promptTarget, ai_history FROM notes"
    )

    notes = []
    for row in cursor.fetchall():
        try:
            ai_history = (
                json.loads(row[6]) if row[6] else []
            )  # 🔥 JSONをPythonリストに変換
        except json.JSONDecodeError:
            ai_history = []

        notes.append(
            {
                "id": row[0],
                "title": row[1],
                "content": row[2],
                "tag": row[3],
                "type": row[4],
                "promptTarget": row[5],
                "ai_history": ai_history,  # ✅ ここでリストとしてセット
            }
        )

    conn.close()
    return notes


@app.route("/update_ai_history/<int:note_id>", methods=["PUT"])
def update_ai_history(note_id):
    """AIの履歴を更新 (ユーザーの修正リクエストも含める)"""
    data = request.json
    role = data.get("role")  # "user" または "ai"
    text = data.get("text")
    timestamp = data.get("timestamp")

    if not text or not role:
        return jsonify({"error": "role と text は必須です"}), 400

    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()

    # `ai_history` カラムがない場合は追加
    cursor.execute("PRAGMA table_info(notes)")
    columns = [column[1] for column in cursor.fetchall()]
    if "ai_history" not in columns:
        cursor.execute("ALTER TABLE notes ADD COLUMN ai_history TEXT DEFAULT '[]'")
        conn.commit()

    # 現在の履歴を取得
    cursor.execute("SELECT ai_history FROM notes WHERE id = ?", (note_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "ノートが見つかりません"}), 404

    try:
        history = json.loads(row[0]) if row[0] else []
    except json.JSONDecodeError:
        history = []

    # 新しい履歴を追加
    history.append({"role": role, "text": text, "timestamp": timestamp})
    new_history_json = json.dumps(history)

    # 更新処理
    cursor.execute(
        "UPDATE notes SET ai_history = ? WHERE id = ?", (new_history_json, note_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "AI履歴を更新しました", "ai_history": history}), 200







@app.route("/get_full_history/<int:id>", methods=["GET"])
def get_full_history(id):
    # ここでデータを取得（仮のデータを返す）
    history = [
        {"role": "user", "text": "修正リクエスト", "timestamp": "2025-02-04T10:00:00"},
        {"role": "ai", "text": "AI の修正結果", "timestamp": "2025-02-04T10:01:00"},
    ]
    return jsonify({"history": history})



# OpenAI クライアントの作成
client = openai.OpenAI()

@app.route("/generate_revision/<int:note_id>", methods=["POST"])
def generate_revision(note_id):
    """ユーザーの修正リクエストを受け取り、AIが修正案を生成する"""
    data = request.json
    user_prompt = data.get("text")
    timestamp = data.get("timestamp")

    if not user_prompt:
        return jsonify({"error": "修正リクエストの内容が必要です"}), 400

    try:
        # **プロンプトの修正**
        system_prompt = (
            "あなたは優れたAIプロンプト設計者です。"
            "ユーザーが指定した指示に基づき、より明確で効果的なプロンプトに改善してください。"
        )

        logging.debug(f"Generating AI revision for note_id: {note_id} with prompt: {user_prompt}")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        )

        # **AIの修正応答**
        ai_response_text = response.choices[0].message.content.strip()

        # **履歴に保存**
        update_ai_history(note_id, ai_response_text, timestamp)

        logging.debug(f"AI Revision Response: {ai_response_text}")

        return jsonify(
            {
                "message": "AIの修正案が生成されました",
                "ai_response": ai_response_text,
            }
        ), 200

    except Exception as e:
        logging.error(f"OpenAI APIリクエストエラー: {str(e)}", exc_info=True)
        return jsonify({"error": f"OpenAI APIリクエストエラー: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
