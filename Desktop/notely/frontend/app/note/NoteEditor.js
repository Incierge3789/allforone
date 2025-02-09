"use client";
import { useState, useEffect } from "react";
import { FaSave, FaTrash, FaRobot } from "react-icons/fa";

export default function NoteEditor({ note, onSave, onDelete, onClose }) {
    console.log("🛠 NoteEditor に渡された note:", note);

    // ✅ `useState(null)` を `useState("")` に修正（undefined エラーを防ぐ）
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tag, setTag] = useState("");
    const [promptTarget, setPromptTarget] = useState("");

    useEffect(() => {
        if (note) {
            console.log("🔄 useEffect で note のデータを設定:", note);
            setTitle(note.title || "");
            setContent(note.content || "");
            setTag(note.tag || "");
            setPromptTarget(note.promptTarget || "");
        }
    }, [note]);

    const handleSave = () => {
        console.log("🚀 保存前の title:", title);
        console.log("🚀 保存前の content:", content);

        // ✅ 空文字チェックを修正
        if (!title.trim() || !content.trim()) {
            alert("⚠ タイトルと内容を入力してください！");
            return;
        }

        onSave({
            id: note.id,
            title,
            content,
            tag,
            type: note.type || "normal",
            promptTarget,
            ai_history: note.ai_history || [],  // ✅ ここを追加して履歴を維持
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-3/5 relative">
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-xl font-semibold text-black">📝 ノート編集</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✖</button>
                </div>

                <div className="mt-4 space-y-4">
                    <input
                        type="text"
                        placeholder="タイトル"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border rounded text-black"
                    />
                    <textarea
                        rows="5"
                        placeholder="内容を入力..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 border rounded resize-none text-black"
                    />
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="タグ"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            className="p-3 border rounded w-1/3 text-black"
                        />
                        <select
                            value={promptTarget}
                            onChange={(e) => setPromptTarget(e.target.value)}
                            className="p-3 border rounded w-2/3 text-black"
                        >
                            <option value="">AIモデルを選択</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="stable-diffusion">Stable Diffusion</option>
                            <option value="sora">Sora</option>
                            <option value="claude">Claude</option>
                            <option value="gemini">Gemini</option>
                            <option value="perplexity">Perplexity</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-between">
                    <button 
                        onClick={() => onDelete(note.id)} 
                        className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
                    >
                        <FaTrash className="mr-2" /> 削除
                    </button>
                    <div className="flex gap-2">
                        {promptTarget && (
                            <button 
                                onClick={handleSave} 
                                className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
                            >
                                <FaRobot className="mr-2" /> AI送信
                            </button>
                        )}
                        <button 
                            onClick={handleSave} 
                            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                        >
                            <FaSave className="mr-2" /> 保存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}