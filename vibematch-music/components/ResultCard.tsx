import React from 'react';
import { RecommendedSong } from '../types';
import { Disc, ThumbsUp, ThumbsDown, X, Info, Crown, Music4 } from 'lucide-react';

interface ResultCardProps {
  song: RecommendedSong;
  index: number;
  onFeedback: (index: number, type: 'like' | 'skip' | 'none') => void;
  onSelect: (song: RecommendedSong) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ song, index, onFeedback, onSelect }) => {
  const rank = index + 1;
  // Using picsum with a deterministic seed based on title
  const seed = song.title.replace(/\s/g, '') + index;
  const imageUrl = `https://picsum.photos/seed/${seed}/300/300`;

  const isLiked = song.feedback === 'like';
  const isSkipped = song.feedback === 'skip';

  // Rank styling configuration
  let rankBg = "bg-slate-700";
  let rankText = "text-slate-300";
  let borderColor = "border-slate-700";
  let shadowClass = "hover:shadow-xl";
  
  if (rank === 1) {
    rankBg = "bg-gradient-to-br from-yellow-400 to-yellow-600";
    rankText = "text-yellow-950";
    borderColor = "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
    shadowClass = "hover:shadow-[0_0_25px_rgba(234,179,8,0.2)]";
  } else if (rank === 2) {
    rankBg = "bg-gradient-to-br from-slate-300 to-slate-400";
    rankText = "text-slate-800";
    borderColor = "border-slate-400/50";
  } else if (rank === 3) {
    rankBg = "bg-gradient-to-br from-orange-400 to-orange-600";
    rankText = "text-orange-900";
    borderColor = "border-orange-700/50";
  }

  if (isLiked) {
    borderColor = "border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]";
    shadowClass = "";
  } else if (isSkipped) {
    borderColor = "border-slate-800 opacity-50 grayscale";
    shadowClass = "";
  }

  return (
    <div 
      className={`group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl overflow-hidden border ${borderColor} transition-all duration-300 flex flex-col md:flex-row cursor-pointer ${
        isLiked ? 'scale-[1.01] bg-slate-800/80' : isSkipped ? 'scale-95' : `hover:bg-slate-800/80 hover:scale-[1.01] ${shadowClass}`
      }`}
      onClick={() => onSelect(song)}
    >
      {/* Mobile Rank Badge (Top Left) */}
      <div className={`md:hidden absolute top-0 left-0 px-4 py-1 rounded-br-xl font-bold text-sm z-20 shadow-md ${rankBg} ${rankText}`}>
        #{rank}
      </div>

      {/* Image Section */}
      <div className="relative h-48 md:h-auto md:w-48 lg:w-56 flex-shrink-0 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${song.title} art`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
        
        {/* Desktop Rank Overlay on Image */}
        <div className={`hidden md:flex absolute top-3 left-3 w-10 h-10 rounded-full items-center justify-center font-bold text-lg shadow-lg z-10 ${rankBg} ${rankText}`}>
          {rank}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between relative">
        <div className="flex justify-between items-start mb-2">
          <div className="pr-2 md:pr-0 min-w-0 flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-1 truncate">{song.title}</h3>
            <p className="text-lg text-slate-300 font-medium truncate">{song.artist}</p>
          </div>
          
          <div className="hidden md:block ml-4 flex-shrink-0">
            {rank === 1 && <Crown className="text-yellow-500 drop-shadow-lg animate-pulse" size={28} />}
            {rank === 2 && <Music4 className="text-slate-400 drop-shadow-lg" size={24} />}
            {rank === 3 && <Music4 className="text-orange-500 drop-shadow-lg" size={24} />}
          </div>
        </div>

        <div className="mb-4 flex-grow">
          <div className="flex flex-wrap items-center gap-2 mb-3">
             <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
               {song.genre}
             </span>
             <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
               {song.mood}
             </span>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-700/30">
            <Disc size={18} className="text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
              {song.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 md:pt-0">
           <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-indigo-300 transition-colors">
             <Info size={14} />
             <span className="hidden sm:inline">クリックして詳細とリンクを表示</span>
             <span className="sm:hidden">詳細を見る</span>
           </div>

           {/* Feedback Buttons - Stop propagation to handle button clicks separately */}
           <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
             <button 
               onClick={() => onFeedback(index, isSkipped ? 'none' : 'skip')}
               className={`p-2.5 rounded-xl transition-all border ${
                 isSkipped 
                   ? 'bg-slate-700 text-white border-slate-600' 
                   : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
               }`}
               title="興味なし"
             >
               {isSkipped ? <X size={18}/> : <ThumbsDown size={18}/>}
             </button>
             
             <button 
               onClick={() => onFeedback(index, isLiked ? 'none' : 'like')}
               className={`px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all border ${
                 isLiked 
                   ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-500/30' 
                   : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-pink-400 hover:border-pink-500/30'
               }`}
               title="お気に入り"
             >
               {isLiked ? <ThumbsUp size={18} fill="currentColor" /> : <ThumbsUp size={18}/>}
               <span>いいね</span>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};