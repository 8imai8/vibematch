import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SongInput, RecommendationResponse, RecommendedSong } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const getMusicRecommendations = async (
  favoriteSongs: SongInput[],
  likedSongs: RecommendedSong[] = [],
  skippedSongs: RecommendedSong[] = [],
  targetArtist?: string // Added optional parameter
): Promise<RecommendationResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const modelId = "gemini-2.5-flash";
  
  const songListString = favoriteSongs
    .map((song) => `"${song.title}" by ${song.artist}`)
    .join(", ");

  let prompt = `
    私は以下の曲が大好きです: ${songListString}。
    
    これらの曲の音楽的要素（ジャンル、テンポ、ムード、楽器構成）を分析し、私の好みを理解してください。
    その分析に基づき、まだリストにない、雰囲気が合う5曲を推薦してください。
  `;

  // Add constraint for target artist or default diversity rule
  if (targetArtist && targetArtist.trim() !== "") {
    prompt += `\n\n【重要】: 推薦する5曲は、すべてアーティスト「${targetArtist}」の楽曲に限定してください。入力された好みの曲の雰囲気に近い、このアーティストの名曲や隠れた名曲（B面やアルバム曲など含む）を選んでください。`;
  } else {
    prompt += `\n入力された曲と同じアーティストの曲は避けてください（新しいアーティストとの出会いを求めています）。`;
  }

  if (likedSongs.length > 0 || skippedSongs.length > 0) {
    prompt += `\n\n過去の提案に対するフィードバックがあります:\n`;
    
    if (likedSongs.length > 0) {
      const likedString = likedSongs.map(s => `"${s.title}" by ${s.artist}`).join(", ");
      prompt += `【気に入った曲（これらに似た曲を提案してください）】: ${likedString}\n`;
    }
    
    if (skippedSongs.length > 0) {
      const skippedString = skippedSongs.map(s => `"${s.title}" by ${s.artist}`).join(", ");
      prompt += `【スキップした曲（これらに似た曲は避けてください）】: ${skippedString}\n`;
    }
  }

  prompt += `\n私の好みの分析（「userTasteProfile」）と、各推薦曲について以下の情報を日本語で提供してください：
  1. なぜそれが私に合うのか具体的な理由（「reason」）
  2. 楽曲の深掘りした詳細な解説（「detailedDescription」）。歌詞のテーマやサウンドの特徴、聴きどころなどを含めて150文字程度で。
  3. その曲が配信されている主要なストリーミングサービス（「streamingPlatforms」）。例: Spotify, Apple Music, YouTube Music, Amazon Music, LINE MUSIC など。一般的なメジャー楽曲であれば主要なものは含めてください。`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      userTasteProfile: {
        type: Type.STRING,
        description: "ユーザーの音楽的好みの要約（2-3文）。日本語で。",
      },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "曲名" },
            artist: { type: Type.STRING, description: "アーティスト名" },
            genre: { type: Type.STRING, description: "主要なジャンル（日本語で）" },
            mood: { type: Type.STRING, description: "ムードを一言二言で（例：メランコリック、エネルギッシュ）。日本語で。" },
            reason: { type: Type.STRING, description: "なぜこの曲がユーザーに選ばれたのかの推薦理由（短め）。日本語で。" },
            detailedDescription: { type: Type.STRING, description: "楽曲の詳細な解説（サウンド、歌詞、背景など）。150文字程度。日本語で。" },
            streamingPlatforms: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "この曲が配信されている主なストリーミングサービス名のリスト" 
            },
          },
          required: ["title", "artist", "genre", "mood", "reason", "detailedDescription", "streamingPlatforms"],
        },
      },
    },
    required: ["userTasteProfile", "recommendations"],
  };

  try {
    const result = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "あなたは、インディーからメジャーまで幅広い知識を持つプロの音楽キュレーターです。提案は高品質で、よく考えられたものにしてください。すべての出力は日本語で行ってください。",
      },
    });

    const jsonText = result.text;
    if (!jsonText) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(jsonText) as RecommendationResponse;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};