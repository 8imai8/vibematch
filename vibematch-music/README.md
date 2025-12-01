# VibeMatch

<p align="center">
  <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop" alt="VibeMatch Banner" width="100%" height="200" style="object-fit: cover; border-radius: 10px;">
</p>

**VibeMatch** は、Google Gemini AI を活用した次世代の音楽レコメンデーションアプリです。
あなたの好きな楽曲を分析し、ジャンルやムード、隠れた名曲を提案します。

## ✨ 特徴

- **AI サウンド分析**: 入力された曲からあなたの好みの傾向（User Taste Profile）を言語化。
- **ディープな推薦**: 単なるリストではなく、「なぜおすすめなのか」「聴きどころ」をAIが解説。
- **学習機能**: 提案された曲への「いいね」「スキップ」をリアルタイムで学習し、精度が向上。
- **アーティスト検索**: 特定のアーティストに絞って、そのアーティストの知らない名曲を発掘。
- **ストリーミング連携**: Spotify, Apple Music, YouTube などのリンクを自動生成。

## 🚀 セットアップ

### 必要要件

- Node.js (v18以上推奨)
- Google Gemini API Key

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/yourusername/vibematch.git
   cd vibematch
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   プロジェクトルートに `.env` ファイルを作成し、APIキーを設定します。
   ```bash
   # .env
   API_KEY=your_gemini_api_key_here
   ```
   *注意: APIキーは [Google AI Studio](https://aistudio.google.com/) から取得してください。*

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## 🛠️ 技術スタック

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 Flash (`@google/genai`)
- **API**: iTunes Search API (for autocomplete)
- **Icons**: Lucide React

## 📂 プロジェクト構成

```
vibematch/
├── src/               # (Simulated root in this demo)
│   ├── components/    # UIコンポーネント (ResultCard, SongInputRow etc.)
│   ├── services/      # Gemini API連携ロジック
│   ├── types.ts       # 型定義
│   └── App.tsx        # メインアプリケーション
├── public/            # 静的ファイル
└── README.md
```

## 🤝 コントリビューション

プルリクエストは歓迎します。大きな変更を加える場合は、まずIssueを開いて議論してください。

## 📄 ライセンス

[MIT License](LICENSE)

---
Developed with ❤️ using Google Gemini API
