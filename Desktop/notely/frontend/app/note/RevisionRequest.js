import { useState } from "react";

const RevisionRequest = ({ noteId, fetchNotes }) => {
  const [revisionText, setRevisionText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRevisionSubmit = async () => {
    if (!revisionText.trim()) return;
    if (!fetchNotes) {
      console.error("fetchNotes is not provided!");
         return;
    }
    setLoading(true);

    const timestamp = new Date().toISOString();

    try {
      // 🔹 ユーザーの修正リクエストを履歴に追加
      await fetch(`http://127.0.0.1:5000/update_ai_history/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          text: revisionText,
          timestamp: timestamp
        })
      });

      // 🔹 AIの修正案を取得
      const response = await fetch(`http://127.0.0.1:5000/generate_revision/${noteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: revisionText,
          timestamp: timestamp
        })
      });

      const data = await response.json();
      console.log("AI修正案:", data.ai_response);

      // 🔹 ノートの履歴を最新に更新
      fetchNotes();
      setRevisionText(""); // 入力欄をリセット
    } catch (error) {
      console.error("修正リクエストエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="revision-container">
      <textarea
        value={revisionText}
        onChange={(e) => setRevisionText(e.target.value)}
        placeholder="改善リクエストを入力..."
        className="revision-input"
        disabled={loading}
      />
      <button onClick={handleRevisionSubmit} disabled={loading} className="revision-btn">
        {loading ? <div className="loading-spinner"></div> : "修正リクエスト"}
      </button>
    </div>
  );
};

export default RevisionRequest;
