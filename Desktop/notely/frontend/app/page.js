"use client";
import { useState } from "react";
import NoteList from "./note/NoteList";
import { downloadCSV, downloadJSON, uploadJSON } from "../utils/api";

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("すべて");
    const [refreshKey, setRefreshKey] = useState(0); // 🔥 追加

    const handleUploadJSON = async (file) => {
        try {
            await uploadJSON(file);
            console.log("✅ JSONアップロード成功");
            setRefreshKey(prevKey => prevKey + 1); // 🔥 これで NoteList を強制リロード
        } catch (error) {
            console.error("❌ JSONアップロードエラー:", error);
            alert("JSONアップロードに失敗しました");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-900 text-white rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center">📝 ノート一覧</h1>

            {/* 設定・ダウンロード・アップロード */}
            <div className="flex justify-between mb-6">
                <a href="/settings" className="button-secondary">⚙ 設定</a>
                <div className="flex gap-3">
                    <button onClick={downloadCSV} className="button-primary">CSVダウンロード</button>
                    <button onClick={downloadJSON} className="button-primary">JSONダウンロード</button>           
                    <input type="file" accept="application/json" onChange={(e) => {if (e.target.files.length > 0) {handleUploadJSON(e.target.files[0]);}}} className="hidden" id="upload-json" />
                    <label htmlFor="upload-json" className="button-primary cursor-pointer">JSONアップロード</label>
                </div>
            </div>

            {/* 検索フォーム */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="🔍 フリーワード検索" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-3 border border-gray-600 rounded bg-white text-black"
                />
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}
                    className="p-3 border border-gray-600 rounded bg-white text-black">
                    <option value="すべて">すべてのタグ</option>
                </select>
            </div>

            {/* ノートリストを表示（キーを変更すると強制リロード） */}
            <NoteList key={refreshKey} searchQuery={searchQuery} selectedTag={selectedTag} />
        </div>
    );
}