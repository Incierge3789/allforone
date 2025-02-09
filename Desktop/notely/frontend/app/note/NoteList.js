"use client";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NoteEditor from "./NoteEditor";
import NoteCard from "./NoteCard";
import { fetchNotes, addNote, deleteNote, updateNote, sendPromptToAI } from "../../utils/api";

export default function NoteList({ searchQuery, selectedTag }) {
    const [notes, setNotes] = useState([]);
    const [editNote, setEditNote] = useState(null);
    const [filterType, setFilterType] = useState("all"); // 初期値: すべて
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tag, setTag] = useState("");
    const [type, setType] = useState("normal");
    const [promptTarget, setPromptTarget] = useState("");

    useEffect(() => {
        handleSearch();
    }, [searchQuery, selectedTag, filterType]);

    const handleSearch = async () => {
        try {
            let results = await fetchNotes();
            if (!results) throw new Error("データ取得に失敗しました");

            if (searchQuery.trim()) {
                results = results.filter(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()));
            }
            if (selectedTag !== "すべて") {
                results = results.filter(note => note.tag === selectedTag);
            }
            if (filterType !== "all") {
                results = results.filter(note => note.type === filterType);
            }

            setNotes(results);

            if (editNote) {
                const updatedEditNote = results.find(n => n.id === editNote.id);
                if (updatedEditNote) setEditNote(updatedEditNote);
            }
        } catch (error) {
            toast.error("❌ ノートの取得に失敗しました");
            console.error("❌ fetchNotes エラー:", error);
        }
    };

    const handleEditNote = (note) => {
        console.log("編集ボタンがクリックされた:", note);
        setEditNote(note);
    };

    const handleAddOrUpdateNote = async (updatedNote) => {
        console.log("📝 handleAddOrUpdateNote が呼ばれました:", updatedNote);

        // 🔍 新規ノート作成時、updatedNote が `undefined` の場合は手動で作成
        if (!updatedNote || !updatedNote.id) {
            updatedNote = {
                title: title.trim(),
                content: content.trim(),
                tag: tag.trim() || "未分類",
                type,
                promptTarget: type === "prompt" ? promptTarget : "",
            };
        }

        if (!updatedNote?.title || !updatedNote?.content) {
            toast.error("⚠ タイトルと内容を入力してください！");
            return;
        }

        try {
            if (updatedNote.id) {
                console.log("🔄 既存のノートを更新:", updatedNote);
                await updateNote(updatedNote.id, updatedNote.title, updatedNote.content, updatedNote.tag, updatedNote.type, updatedNote.promptTarget);
                toast.success("✅ ノートを更新しました！");
            } else {
                console.log("➕ 新規ノートを追加:", updatedNote);
                const newNote = await addNote(updatedNote.title, updatedNote.content, updatedNote.tag, updatedNote.type, updatedNote.promptTarget);
                console.log("✅ 追加後のノート:", newNote);
                toast.success("✅ ノートを追加しました！");
            }

            setEditNote(null);
            setNotes(await fetchNotes());

            // ✅ 入力フォームのリセット
            setTitle("");
            setContent("");
            setTag("");
            setType("normal");
            setPromptTarget("");

        } catch (error) {
            toast.error("❌ ノートの保存に失敗しました");
            console.error("❌ handleAddOrUpdateNote エラー:", error);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await deleteNote(noteId);

            // ✅ 現在のフィルターに基づいてノートを再取得
            let updatedNotes = await fetchNotes();

            // ✅ 削除後にフィルターを適用し直す
            if (filterType !== "all") {
                updatedNotes = updatedNotes.filter(note => note.type === filterType);
            }

            setNotes(updatedNotes);

            // ✅ フィルターのリセット（すべてのノートを表示する場合のみ）
            if (updatedNotes.length === 0) {
                setFilterType("all");
            }

            toast.info("🗑 ノートを削除しました！");
        } catch (error) {
            toast.error("❌ ノート削除に失敗しました");
            console.error("❌ handleDeleteNote エラー:", error);
        }
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />

            {/* ✅ ノート追加フォーム */}
            <div className="grid grid-cols-6 gap-4 mb-6">
                <input type="text" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="p-3 border border-gray-600 rounded bg-white text-black" />
                <input type="text" placeholder="内容" value={content} onChange={(e) => setContent(e.target.value)}
                    className="p-3 border border-gray-600 rounded bg-white text-black" />
                <input type="text" placeholder="タグ" value={tag} onChange={(e) => setTag(e.target.value)}
                    className="p-3 border border-gray-600 rounded bg-white text-black" />
                <select value={type} onChange={(e) => setType(e.target.value)}
                    className="p-3 border border-gray-600 rounded bg-white text-black">
                    <option value="normal">通常メモ</option>
                    <option value="prompt">AIプロンプト</option>
                </select>
                {type === "prompt" && (
                    <select value={promptTarget} onChange={(e) => setPromptTarget(e.target.value)}
                        className="p-3 border border-gray-600 rounded bg-white text-black">
                        <option value="">AIモデルを選択</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="stable-diffusion">Stable Diffusion</option>
                        <option value="sora">Sora</option>
                        <option value="perplexity">Perplexity</option>
                        <option value="gemini">Gemini</option>
                        <option value="claude">Claude</option>
                    </select>
                )}
                <button onClick={handleAddOrUpdateNote} className="button-primary">
                    追加
                </button>
            </div>

            {/* ✅ フィルター（ボタン形式） */}
            <div className="flex gap-4 mb-6">
                
                <button 
                    className={`px-4 py-2 rounded ${filterType === "all" ? "bg-blue-500 text-white" : "bg-gray-300"}`} 
                    onClick={() => setFilterType("all")}
                >
                    すべて
                </button>
                <button 
                    className={`px-4 py-2 rounded ${filterType === "normal" ? "bg-blue-500 text-white" : "bg-gray-300"}`} 
                    onClick={() => setFilterType("normal")}
                >
                    通常メモ
                </button>
                <button 
                    className={`px-4 py-2 rounded ${filterType === "prompt" ? "bg-blue-500 text-white" : "bg-gray-300"}`} 
                    onClick={() => setFilterType("prompt")}
                >
                    AIプロンプト
                </button>
            </div>

            {/* ✅ ノート一覧 */}
            <div className="space-y-4">
                {notes.map((note) => (
                    <NoteCard 
                        key={note.id} 
                        note={note} 
                        onEdit={handleEditNote} 
                        onDelete={() => handleDeleteNote(note.id)} 
                        onSendToAI={note.type === "prompt" ? sendPromptToAI : null}
                    />
                ))}
                {editNote && (
                    <NoteEditor 
                        key={editNote.id || "new"}  
                        note={editNote}
                        onSave={handleAddOrUpdateNote}
                        onDelete={(id) => handleDeleteNote(id)}
                        onClose={() => setEditNote(null)}
                    />
                )}
            </div>
        </div>
    );
}