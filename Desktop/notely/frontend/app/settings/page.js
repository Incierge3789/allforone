"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  // ✅ 追加
import { saveAPIKeys } from "../../utils/api";


export default function Settings() {
    const router = useRouter();  // ✅ ルーター取得

    const [apiKeys, setApiKeys] = useState({
        "gpt-4o": "",
        "claude": "",
        "gemini": "",
        "perplexity": "",
    });

    useEffect(() => {
        // localStorage からAPIキーを読み込む
        setApiKeys({
            "gpt-4o": localStorage.getItem("apiKey_gpt-4o") || "",
            "claude": localStorage.getItem("apiKey_claude") || "",
            "gemini": localStorage.getItem("apiKey_gemini") || "",
            "perplexity": localStorage.getItem("apiKey_perplexity") || ""
        });
    }, []);

    const handleSave = () => {
        // APIキーを localStorage に保存
        Object.keys(apiKeys).forEach((key) => {
            localStorage.setItem(`apiKey_${key}`, apiKeys[key]);
        });

        alert("設定を保存しました！");

        router.push("/");  // ✅ 保存後にノート一覧へ戻る
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">⚙ 設定</h1>

            {Object.keys(apiKeys).map((key) => (
                <div key={key} className="mb-3">
                    <label className="block text-sm font-medium">{key} APIキー</label>
                    <input
                        type="text"
                        value={apiKeys[key]}
                        onChange={(e) => setApiKeys({ ...apiKeys, [key]: e.target.value })}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
                    />
                </div>
            ))}

            <button
                onClick={handleSave}
                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded">
                保存
            </button>
        </div>
    );
}