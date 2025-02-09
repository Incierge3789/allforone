以下は Notely の README を 英語と日本語で読みやすいマークダウン形式 にしたものです。

# 📝 Notely - AI-Powered Note Management App  
# 📝 Notely - AIを活用したメモ管理アプリ  

## 📌 Overview | 概要  

**Notely** is an AI-driven note-taking application that helps you organize, edit, and manage notes effortlessly.  
It integrates **GPT-4o, Claude, and Gemini** AI models to enhance note creation and optimization.  

**Notely** は、AI を活用してメモを整理・修正し、履歴管理も可能にするアプリです。  
**GPT-4o、Claude、Gemini** などの AI モデルを活用し、ユーザーのメモを最適化します。  

---

## 🚀 Features | 主な機能  

### ✅ AI-Powered Enhancements | AIによるメモ強化  
- AI-assisted note refinement (**GPT-4o, Claude, Gemini**)  
- Smart formatting & content optimization  
- AI-generated suggestions based on note context  

- **AI によるメモ修正機能**（GPT-4o, Claude, Gemini）  
- **スマートなフォーマット調整 & 内容最適化**  
- **メモの内容に基づいた AI の提案**  

### ✅ Note Management & History | メモ管理 & 履歴機能  
- Save and track revision history (**latest 3 changes displayed, full history available**)  
- Advanced search & filter for easy access to notes  
- Export notes as **JSON / CSV**  

- **修正履歴の保存と管理**（最新3件表示 + **「もっと見る」**で全履歴確認）  
- **メモの検索 & フィルター機能**  
- **JSON / CSV 形式でのエクスポート**  

### ✅ Modern Web Technologies | 最新技術スタック  
- **Frontend:** Next.js 15 (**App Router**)  
- **Backend:** Flask API  
- **Search:** Weaviate (**vector-based search**)  
- **Styling:** Tailwind CSS  

- **フロントエンド:** Next.js 15 (**App Router**)  
- **バックエンド:** Flask API  
- **検索:** Weaviate (**ベクトル検索**)  
- **デザイン:** Tailwind CSS  

---

## 🛠️ Installation & Setup | インストール & 設定  

### 1️⃣ Clone the Repository | リポジトリをクローン  
```bash
git clone https://github.com/Incierge3789/notely.git
cd notely

2️⃣ Frontend Setup | フロントエンドのセットアップ

cd frontend
npm install  # Install dependencies
npm run dev  # Start development server

👉 Access frontend at: http://localhost:3000

cd frontend
npm install  # 依存関係をインストール
npm run dev  # 開発サーバーを起動

👉 フロントエンドにアクセス: http://localhost:3000

3️⃣ Backend Setup | バックエンドのセットアップ

cd ../backend
python -m venv venv  # Create virtual environment
source venv/bin/activate  # Activate (Windows: `venv\Scripts\activate`)
pip install -r requirements.txt  # Install dependencies
python app.py  # Start Flask server

👉 Access API at: http://127.0.0.1:5000

cd ../backend
python -m venv venv  # 仮想環境を作成
source venv/bin/activate  # 仮想環境をアクティベート（Windows: `venv\Scripts\activate`）
pip install -r requirements.txt  # 必要なパッケージをインストール
python app.py  # Flask サーバーを起動

👉 バックエンド API にアクセス: http://127.0.0.1:5000

4️⃣ Setup OpenAI API Key | OpenAI API キーの設定

echo "OPENAI_API_KEY=your-openai-api-key" > .env

or manually create .env file:

OPENAI_API_KEY=your-openai-api-key

echo "OPENAI_API_KEY=your-openai-api-key" > .env

または、手動で .env を作成し、以下のように記入：

OPENAI_API_KEY=your-openai-api-key

📌 Technology Stack | 使用技術

Technology	Description
Next.js 15	Frontend framework (React-based)
Flask	Backend API
OpenAI API	AI-powered note enhancement
Weaviate	Vector search for notes
Tailwind CSS	Frontend styling

技術	詳細
Next.js 15	フロントエンド（React ベース）
Flask	バックエンド API
OpenAI API	AI 修正機能
Weaviate	ベクトル検索（メモ検索用）
Tailwind CSS	フロントエンドのデザイン

🎯 TODO | 未実装の課題
	•	Upgrade OpenAI API compatibility (Current issue: ChatCompletion.create() deprecation error)
	•	Enhance note history management (pagination & detailed tracking)
	•	Implement user authentication (login & personalized notes)
	•	Fix fetchNotes is not a function error
	•	Develop /get_full_history/{note_id} API & resolve 404 errors
	•	OpenAI API の最新版対応（現在 ChatCompletion.create() 廃止エラー発生）
	•	履歴管理の拡張（ページネーション & より詳細な履歴管理）
	•	ユーザー認証機能の追加（ログイン & メモのパーソナライズ）
	•	fetchNotes is not a function エラーの修正
	•	/get_full_history/{note_id} API の実装 & 404 エラー修正

📜 License | ライセンス

This project is licensed under the MIT License.
本プロジェクトは MIT ライセンス で公開されています。

🔥 Boost your productivity with Notely - AI-powered note-taking made easy!
✍️ Looking for contributors & developers! 🚀

🔥 Notely を活用し、AI でメモをもっと便利に！
✍️ 開発 & 貢献者募集中！ 🚀
