import React, { useState, useCallback } from 'react';
import { Plus, Sparkles, Music2, RefreshCcw, AlertCircle, ThumbsUp, ArrowRight, User, Mic2 } from 'lucide-react';
import { SongInput, RecommendationResponse, AppState, RecommendedSong } from './types';
import { SongInputRow } from './components/SongInputRow';
import { ResultCard } from './components/ResultCard';
import { SongDetailModal } from './components/SongDetailModal';
import { getMusicRecommendations } from './services/geminiService';

// Simple ID generator helper
const generateId = () => Math.random().toString(36).substring(2, 15);

const INITIAL_SONGS: SongInput[] = [
  { id: generateId(), title: '', artist: '' },
  { id: generateId(), title: '', artist: '' },
  { id: generateId(), title: '', artist: '' },
];

const App: React.FC = () => {
  const [songs, setSongs] = useState<SongInput[]>(INITIAL_SONGS);
  const [targetArtist, setTargetArtist] = useState<string>(''); // New state for target artist
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<RecommendedSong | null>(null);
  
  // Store history of liked/skipped songs for learning
  const [likedHistory, setLikedHistory] = useState<RecommendedSong[]>([]);
  const [skippedHistory, setSkippedHistory] = useState<RecommendedSong[]>([]);
  const [generationCount, setGenerationCount] = useState(0);

  // -- Handlers --

  const handleAddSong = () => {
    if (songs.length < 10) {
      setSongs((prev) => [...prev, { id: generateId(), title: '', artist: '' }]);
    }
  };

  const handleRemoveSong = (id: string) => {
    if (songs.length > 1) {
      setSongs((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleInputChange = useCallback((id: string, field: 'title' | 'artist', value: string) => {
    setSongs((prev) =>
      prev.map((song) => (song.id === id ? { ...song, [field]: value } : song))
    );
  }, []);

  const handleSubmit = async (isRefinement = false) => {
    // Validation
    const validSongs = songs.filter(s => s.title.trim() !== '' && s.artist.trim() !== '');
    
    if (validSongs.length === 0) {
      setError("少なくとも1曲は入力してください。");
      return;
    }
    
    setError(null);
    setAppState(AppState.LOADING);

    try {
      // If refinement, pass the history. If new start, pass empty history (handled by variable scope unless reset)
      const currentLiked = isRefinement ? likedHistory : [];
      const currentSkipped = isRefinement ? skippedHistory : [];

      const response = await getMusicRecommendations(validSongs, currentLiked, currentSkipped, targetArtist);
      
      // Add IDs to new recommendations for React keys
      response.recommendations = response.recommendations.map(r => ({
        ...r,
        id: generateId(),
        feedback: 'none'
      }));

      setResult(response);
      setAppState(AppState.RESULTS);
      setGenerationCount(prev => prev + 1);
    } catch (err) {
      setError("提案の生成に失敗しました。入力内容を確認してもう一度お試しください。");
      setAppState(AppState.ERROR);
    }
  };

  const handleFeedback = (index: number, type: 'like' | 'skip' | 'none') => {
    if (!result) return;
    
    const newRecommendations = [...result.recommendations];
    newRecommendations[index].feedback = type;
    
    setResult({
      ...result,
      recommendations: newRecommendations
    });
  };

  const handleSelectSong = (song: RecommendedSong) => {
    setSelectedSong(song);
  };

  const handleCloseModal = () => {
    setSelectedSong(null);
  };

  const handleRefine = async () => {
    if (!result) return;

    // 1. Add current feedback to history
    const newLiked = result.recommendations.filter(r => r.feedback === 'like');
    const newSkipped = result.recommendations.filter(r => r.feedback === 'skip');

    // Only update if there are changes, but we always want to generate new songs
    setLikedHistory(prev => [...prev, ...newLiked]);
    setSkippedHistory(prev => [...prev, ...newSkipped]);

    setAppState(AppState.LOADING);
    const validSongs = songs.filter(s => s.title.trim() !== '' && s.artist.trim() !== '');

    try {
      const combinedLiked = [...likedHistory, ...newLiked];
      const combinedSkipped = [...skippedHistory, ...newSkipped];

      const response = await getMusicRecommendations(validSongs, combinedLiked, combinedSkipped, targetArtist);
      
      response.recommendations = response.recommendations.map(r => ({
        ...r,
        id: generateId(),
        feedback: 'none'
      }));

      setResult(response);
      setAppState(AppState.RESULTS);
      setGenerationCount(prev => prev + 1);
    } catch (err) {
      setError("更新に失敗しました。");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setError(null);
    setLikedHistory([]);
    setSkippedHistory([]);
    setGenerationCount(0);
    setResult(null);
    // Note: We keep targetArtist and songs as is for easier retrying, or clear if desired. 
    // Let's keep them for better UX.
  };

  // -- Render Helpers --

  const renderHeader = () => (
    <header className="w-full py-8 px-4 flex flex-col items-center justify-center border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Music2 className="text-white h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
          VibeMatch
        </h1>
      </div>
      <p className="text-slate-500 text-sm font-medium">AI音楽ディスカバリー</p>
    </header>
  );

  const renderInputView = () => (
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">最近のお気に入りは？</h2>
        <p className="text-slate-400">
          好きな曲を3曲以上教えてください。<br className="hidden md:block" />あなたの好みを分析し、次に聴くべき最高の曲を提案します。
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {songs.map((song, index) => (
          <SongInputRow
            key={song.id}
            song={song}
            index={index}
            onChange={handleInputChange}
            onRemove={handleRemoveSong}
            canRemove={songs.length > 1}
          />
        ))}
        
        {songs.length < 10 && (
          <button
            onClick={handleAddSong}
            className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} />
            曲を追加
          </button>
        )}
      </div>

      {/* Target Artist Filter */}
      <div className="mb-8 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-indigo-300 font-medium">
           <User size={18} />
           <span>特定のアーティストから探す（任意）</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mic2 className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={targetArtist}
            onChange={(e) => setTargetArtist(e.target.value)}
            placeholder="アーティスト名を入力 (例: 星野源) - 空欄なら全アーティストから提案"
            className="w-full bg-slate-950 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-slate-600 transition-all"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2 pl-1">
          ※ 入力すると、上記の「お気に入り曲」の雰囲気に近い、このアーティストの曲だけを提案します。
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center">
        {error && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2 justify-center">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <button
          onClick={() => handleSubmit(false)}
          className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-full text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 w-full md:w-auto overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2 justify-center">
            <Sparkles className="animate-pulse" size={20} />
            {targetArtist ? `${targetArtist}の曲を発見` : '新しい音楽を発見'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );

  const renderLoadingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-fuchsia-500 border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-4 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
          <Music2 className="text-slate-400 animate-bounce" size={32} />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">バイブスを分析中...</h2>
      <p className="text-slate-400 animate-pulse text-center max-w-md">
        {targetArtist 
          ? `お気に入りの傾向から、${targetArtist}の最適な楽曲を選出しています。`
          : "ジャンルを解体し、テンポを検出し、あなたのための完璧なプレイリストを合成しています。"}
      </p>
    </div>
  );

  const renderResultsView = () => {
    if (!result) return null;

    return (
      <div className="w-full animate-fade-in pb-16">
        {/* User Profile Analysis */}
        <div className="mb-10 bg-slate-800/30 border border-slate-700 rounded-2xl p-6 md:p-8 backdrop-blur-sm max-w-4xl mx-auto">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">あなたのサウンド・プロフィール</h3>
          <p className="text-lg md:text-xl text-white leading-relaxed font-light">
            {result.userTasteProfile}
          </p>
          {targetArtist && (
             <div className="mt-4 pt-4 border-t border-slate-700/50 text-sm text-indigo-200 flex items-center gap-2">
               <User size={14} />
               <span>フィルター適用中: <strong>{targetArtist}</strong></span>
             </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
              ベストマッチ・ランキング
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-400 font-medium border border-slate-700">
              Generation #{generationCount}
            </span>
          </h3>
          <p className="text-xs text-slate-500">クリックで詳細を表示</p>
        </div>

        {/* Ranking List Container */}
        <div className="flex flex-col gap-4 mb-12 max-w-4xl mx-auto">
          {result.recommendations.map((rec, idx) => (
            <ResultCard 
              key={rec.id || idx} 
              song={rec} 
              index={idx} 
              onFeedback={handleFeedback}
              onSelect={handleSelectSong}
            />
          ))}
        </div>

        {/* Refinement / Actions Area */}
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-center">
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">いかがでしたか？</h4>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              曲に「いいね」<ThumbsUp size={14} className="inline mx-1" /> または「興味なし」をつけると、<br/>
              AIがあなたの好みを学習し、次回の提案精度が向上します。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-medium border border-slate-700 min-w-[160px]"
            >
              <RefreshCcw size={18} />
              最初からやり直す
            </button>

            <button
              onClick={handleRefine}
              className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/20 min-w-[200px]"
            >
              <span>フィードバックを反映して更新</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
        </div>

        {/* Liked Songs History (If any) */}
        {likedHistory.length > 0 && (
          <div className="mt-16 pt-8 border-t border-slate-800 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ThumbsUp className="text-pink-500" size={20} />
              コレクション ({likedHistory.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {likedHistory.map((song, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-center gap-3">
                   <div className="w-10 h-10 rounded bg-slate-700 flex-shrink-0 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${song.title.replace(/\s/g, '')}/100/100`} className="w-full h-full object-cover opacity-70" />
                   </div>
                   <div className="min-w-0">
                     <div className="text-sm font-bold text-white truncate">{song.title}</div>
                     <div className="text-xs text-slate-400 truncate">{song.artist}</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderErrorView = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
      <div className="p-4 bg-red-500/10 rounded-full mb-4">
        <AlertCircle size={48} className="text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">エラーが発生しました</h2>
      <p className="text-slate-400 text-center max-w-md mb-6">
        {error || "音楽の神様との接続に失敗しました。"}
      </p>
      <button
        onClick={handleReset}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
      >
        もう一度試す
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      {renderHeader()}
      
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {appState === AppState.INPUT && renderInputView()}
        {appState === AppState.LOADING && renderLoadingView()}
        {appState === AppState.RESULTS && renderResultsView()}
        {appState === AppState.ERROR && renderErrorView()}
      </main>

      {/* Detail Modal */}
      {selectedSong && (
        <SongDetailModal song={selectedSong} onClose={handleCloseModal} />
      )}

      <footer className="py-6 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} VibeMatch Music. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;