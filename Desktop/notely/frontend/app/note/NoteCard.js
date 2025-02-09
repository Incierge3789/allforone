"use client";
import { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrash, FaRocket, FaRobot, FaUser } from "react-icons/fa";
import RevisionRequest from "./RevisionRequest";

export default function NoteCard({ note, fetchNotes, onEdit, onDelete, onSendToAI }) {
    const [showHistory, setShowHistory] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const MAX_HISTORY_DISPLAY = 3; // 🔹 初期表示の履歴数

    const historyRef = useRef(null);

    // 🔹 AIの履歴が増えたらスクロール
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [note.ai_history]);

    // Timestamp を見やすい形式に変換
    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).replace(/\//g, "-"); // YYYY-MM-DD HH:mm 形式に統一
    };

    return (
        <div className="note-card relative p-4 border rounded-lg bg-white text-black shadow-md">
            {/* AIモデル表示 */}
            {note.promptTarget && (
                <span className="absolute top-2 right-3 bg-blue-500 text-white px-3 py-1 text-xs rounded-full shadow">
                    {note.promptTarget}
                </span>
            )}

            <h2 className="text-xl font-semibold">{note.title || "無題"}</h2>
            <p className="text-gray-700">{note.content || "（内容なし）"}</p>
            <span className="tag inline-flex items-center justify-center mx-1 my-1 bg-gray-200 px-2 py-1 rounded">
                {note.tag || "未分類"}
            </span>

            {/* AI履歴をスレッド表示 */}
            {note.ai_history && note.ai_history.length > 0 && (
                <div className="mt-4 p-2 border-t">
                    <button 
                        onClick={() => setShowHistory(!showHistory)} 
                        className="history-toggle-btn"
                    >
                        {showHistory ? "▲ 履歴を隠す" : "📜 履歴を表示"}
                    </button>

                    <div ref={historyRef} className={`ai-history-container ${showHistory ? "open" : ""}`}>
                        {(showAllHistory ? note.ai_history : note.ai_history.slice(0, MAX_HISTORY_DISPLAY)).map((entry, index) => {
                            const role = entry.role?.trim().toLowerCase();
                            return (
                                <div key={index} className={`flex items-center ${role === "ai" ? "justify-end" : "justify-start"}`}>
                                    <div className={`p-3 rounded-lg shadow flex items-center space-x-2 ${role === "ai" ? "ai-response" : "user-message"}`}>
                                        {role === "ai" ? <FaRobot className="text-lg" /> : <FaUser className="text-lg" />}
                                        <div>
                                            <p className="text-sm">{entry.text}</p>
                                            <span className="timestamp">{formatTimestamp(entry.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 🔹「もっと見る」ボタンを追加 */}
                    {note.ai_history.length > MAX_HISTORY_DISPLAY && !showAllHistory && (
                        <button 
                            className="text-blue-500 hover:underline text-sm"
                            onClick={() => window.open(`/history/${note.id}`, "_blank")}
                        >
                        もっと見る
                        </button>
                    )}
                </div>
            )}

            {/* 🔹 修正リクエストのUIを追加 */}
            <RevisionRequest noteId={note.id} fetchNotes={fetchNotes} />

            {/* ボタンデザイン */}
            <div className="mt-3 flex space-x-2">
                <button 
                    className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600" 
                    onClick={() => onEdit(note)}
                >
                    <FaPencilAlt className="mr-1" /> 編集
                </button>
                <button 
                    className="flex items-center px-3 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600" 
                    onClick={() => onDelete(note.id)}
                >
                    <FaTrash className="mr-1" /> 削除
                </button>
                {onSendToAI && (
                    <button 
                        className="flex items-center px-3 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600" 
                        onClick={() => onSendToAI(note.id)}
                    >
                        <FaRocket className="mr-1" /> AI送信
                    </button>
                )}
            </div>
        </div>
    );
}