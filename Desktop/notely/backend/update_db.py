import sqlite3

def upgrade_db():
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()

    # 🔥 `ai_history` カラムを追加（JSON 形式の履歴を格納）
    try:
        cursor.execute("ALTER TABLE notes ADD COLUMN ai_history TEXT DEFAULT '[]'")
        conn.commit()
        print("✅ `ai_history` カラムを追加しました")
    except sqlite3.OperationalError:
        print("⚠ `ai_history` カラムはすでに存在しています")

    conn.close()

if __name__ == "__main__":
    upgrade_db()
