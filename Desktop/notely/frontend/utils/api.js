const API_URL = "http://127.0.0.1:5000";  // FlaskサーバーのURL


// ✅ **ノートを取得する関数を修正 (AI履歴を含める)**
export const fetchNotes = async () => {
    try {
        console.log("📡 fetchNotes: ノート一覧を取得開始...");

        const response = await fetch(`${API_URL}/get_notes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            mode: "cors",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`データ取得エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // ✅ AI履歴を空配列で補完
        data.forEach(note => {
            if (!note.ai_history) {
                note.ai_history = [];
            }
        });

        console.log("✅ fetchNotes: ノート一覧を取得成功:", data);
        return data;
    } catch (error) {
        console.error("❌ fetchNotes: ノートの取得に失敗しました:", error.message);
        return null;
    }
};

export {
    fetchNotes,
    addNote,
    deleteNote,
    updateNote,
    sendPromptToAI,
    updateAIHistory,
    saveAIResponseAsNote
};

// ✅ AIエンドポイントの事前定義
const AI_API_ENDPOINTS = {
    "gpt-4o": "https://api.openai.com/v1/chat/completions",
    "claude": "https://api.anthropic.com/v1/complete",
    "gemini": "https://generativelanguage.googleapis.com/v1beta2/models/gemini-pro:generateText",
    "perplexity": "https://api.perplexity.ai/v1/query",
};



// ✅ **ユーザーが設定した APIキー を取得する関数**
const getUserAPIKey = (aiModel) => {
    return localStorage.getItem(`apiKey_${aiModel}`) || null;
};

// ✅ **AIプロンプトを送信する関数 (履歴を更新)**
export const sendPromptToAI = async (noteId) => {
    try {
        const notes = await fetchNotes();
        const note = notes.find(n => n.id === noteId);

        if (!note) {
            throw new Error("指定されたノートが見つかりません");
        }

        const aiEndpoint = AI_API_ENDPOINTS[note.promptTarget];
        if (!aiEndpoint) {
            throw new Error("送信先AIが無効または未指定です");
        }

        const userApiKey = getUserAPIKey(note.promptTarget);
        if (!userApiKey) {
            alert(`⚠ APIキーが設定されていません: ${note.promptTarget}`);
            return { error: "APIキーが設定されていません" };
        }

        const payload = {
            prompt: note.content,
            model: note.promptTarget,
        };

        console.log("📡 AIリクエスト送信:", payload);

        const response = await fetch(aiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userApiKey}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`AIリクエストエラー: ${response.status} ${response.statusText}`);
        }

        const aiResponse = await response.json();

        console.log("📥 AIレスポンス:", aiResponse);

        // ✅ AIレスポンスを履歴に追加
        await updateAIHistory(noteId, aiResponse.response || JSON.stringify(aiResponse));

        return aiResponse;
    } catch (error) {
        console.error(`❌ AIプロンプト送信エラー: ${error.message}`);
        return { error: "AIとの通信に失敗しました" };
    }
};

// ✅ **AI履歴を更新する関数**
export const updateAIHistory = async (noteId, aiResponse) => {
    try {
        const response = await fetch(`${API_URL}/update_ai_history/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response: aiResponse }),
        });

        if (!response.ok) throw new Error("AI履歴の更新に失敗");

        console.log("✅ AI履歴が更新されました");
        return response.json();
    } catch (error) {
        console.error("❌ AI履歴の更新エラー:", error);
        throw error;
    }
};

// ✅ **AIレスポンスをノートとして保存**
export const saveAIResponseAsNote = async (title, content, tag = "AIレスポンス") => {
    try {
        const response = await fetch(`${API_URL}/add_note`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tag }),
        });

        if (!response.ok) throw new Error("ノート追加エラー");
        return response.json();
    } catch (error) {
        console.error("AIレスポンスのノート保存に失敗しました:", error);
    }
};



// ノートを追加する関数（AIプロンプト対応）
export const addNote = async (title, content, tag, type = "normal", promptTarget = "") => {
    try {
        const response = await fetch(`${API_URL}/add_note`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content, tag: tag || "未分類", type, promptTarget }),
        });
        if (!response.ok) throw new Error("ノート追加エラー");
        return response.json();
    } catch (error) {
        console.error("ノートの追加に失敗しました:", error);
    }
};

// ノートを削除する関数
export const deleteNote = async (noteId) => {
    try {
        const response = await fetch(`${API_URL}/delete_note/${noteId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("ノート削除エラー");
        return response.json();
    } catch (error) {
        console.error("ノート削除に失敗:", error);
    }
};

// ノートを更新する関数（AIプロンプト対応）
export const updateNote = async (noteId, title, content, tag, type = "normal", promptTarget = "") => {
    try {
        const requestData = {
            title,
            content,
            tag: tag || "未分類",
            type,
            promptTarget,
        };

        console.log("📡 updateNote リクエスト送信:", {
            id: noteId,
            requestData,
        });

        const response = await fetch(`${API_URL}/update_note/${noteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
        });

        // 📌 レスポンスのステータスコードを確認
        console.log("📥 updateNote レスポンス:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ノート更新エラー: ${errorText}`);
        }

        return response.json();
    } catch (error) {
        console.error("❌ ノート更新に失敗:", error);
        throw error;
    }
};

// ノートを検索する関数
export const searchNotes = async (query) => {
    try {
        const response = await fetch(`${API_URL}/search_notes?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("検索エラー");
        return response.json();
    } catch (error) {
        console.error("ノート検索に失敗:", error);
        return [];
    }
};

// CSVをダウンロードする関数
export const downloadCSV = async () => {
    try {
        const response = await fetch(`${API_URL}/export_csv`);
        if (!response.ok) throw new Error("CSVエクスポートエラー");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notes.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("CSVのダウンロードに失敗:", error);
    }
};

// JSONをダウンロードする関数
export const downloadJSON = async () => {
    try {
        const response = await fetch(`${API_URL}/export_json`);
        if (!response.ok) throw new Error("JSONエクスポートエラー");

        const json = await response.json();
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notes_backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        console.error("JSONのエクスポートに失敗しました:", error);
    }
};

// JSONをアップロードする関数
export const uploadJSON = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = async () => {
            try {
                const jsonData = JSON.parse(reader.result);

                // データが配列であることを確認
                if (!Array.isArray(jsonData)) {
                    throw new Error("アップロードするJSONはリスト形式である必要があります");
                }

                const response = await fetch("http://127.0.0.1:5000/import_json", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(jsonData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("サーバーエラー:", errorData);
                    throw new Error(errorData.error || "JSONアップロードエラー");
                }

                const data = await response.json();
                console.log("アップロード成功:", data);
                resolve(data.notes);
            } catch (error) {
                console.error("JSONアップロードエラー:", error.message);
                reject(error);
            }
        };
        reader.onerror = () => {
            reject(new Error("ファイルの読み取りに失敗しました"));
        };
    });
};

