"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FullHistoryPage() {
    const params = useParams();  // useParams を使う
    const { id } = params;  // ノートIDを取得
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (id) {
            fetch(`http://127.0.0.1:5000/get_full_history/${id}`)
                .then((res) => res.json())
                .then((data) => setHistory(data.history))
                .catch((err) => console.error("履歴取得エラー:", err));
        }
    }, [id]);

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">ノート履歴 (ID: {id})</h1>
            <div className="space-y-4">
                {history.length > 0 ? (
                    history.map((entry, index) => (
                        <div key={index} className={`p-3 rounded-lg shadow ${entry.role === "ai" ? "bg-blue-500" : "bg-gray-600"}`}>
                            <p>{entry.text}</p>
                            <span className="text-sm opacity-70">{entry.timestamp}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">履歴がありません</p>
                )}
            </div>
        </div>
    );
}
