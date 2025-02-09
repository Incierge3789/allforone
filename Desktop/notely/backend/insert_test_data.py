import sqlite3
import json

# データベースに接続
conn = sqlite3.connect("notes.db")
cursor = conn.cursor()

# ✅ AI履歴のテストデータ
ai_history_example = json.dumps([
    "ユーザー: こんにちは、GPT-4o！",
    "GPT-4o: こんにちは！何かお手伝いできますか？",
    "ユーザー: AIの歴史について教えて。",
    "GPT-4o: AIは1950年代から発展してきました…",
])

# ✅ 既存のデータを削除（テスト用）
cursor.execute("DELETE FROM notes WHERE title = 'テストプロンプト'")

# ✅ 新しいテストノートを挿入
cursor.execute(
    "INSERT INTO notes (title, content, tag, type, promptTarget, ai_history) VALUES (?, ?, ?, ?, ?, ?)",
    ("テストプロンプト", "これはテストの内容です", "AI", "prompt", "gpt-4o", ai_history_example)
)

conn.commit()
conn.close()

print("✅ テストデータを追加しました！")

