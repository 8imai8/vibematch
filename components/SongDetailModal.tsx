import React, { useEffect, useRef } from 'react';
import { RecommendedSong } from '../types';
import { X, ExternalLink, Music, Youtube, Disc, Radio } from 'lucide-react';

interface SongDetailModalProps {
  song: RecommendedSong;
  onClose: () => void;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({ song, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const seed = song.title.replace(/\s/g, '');
  const imageUrl = `https://picsum.photos/seed/${seed}/500/500`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} ${song.artist} audio`)}`;

  const getServiceUrl = (service: string) => {
    const query = encodeURIComponent(`${song.title} ${song.artist}`);
    const s = service.toLowerCase();
    if (s.includes('spotify')) return `https://open.spotify.com/search/${query}`;
    if (s.includes('apple')) return `https://music.apple.com/us/search?term=${query}`;
    if (s.includes('amazon')) return `https://music.amazon.co.jp/search/${query}`;
    if (s.includes('line')) return `https://music.line.me/webapp/search?query=${query}`;
    if (s.includes('youtube music')) return `https://music.youtube.com/search?q=${query}`;
    return `https://www.google.com/search?q=${encodeURIComponent(`${service} ${song.title} ${song.artist}`)}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-700 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto custom-scrollbar">
          {/* Header Image Area */}
          <div className="relative h-64 sm:h-80 w-full">
            <img 
              src={imageUrl} 
              alt={song.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="inline-block px-3 py-1 mb-2 rounded-full bg-indigo-500/80 text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                {song.genre}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg mb-1">{song.title}</h2>
              <p className="text-xl text-slate-200 font-medium drop-shadow-md">{song.artist}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Detailed Description */}
            <section>
              <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Disc size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">楽曲解説</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg">
                {song.detailedDescription || song.reason}
              </p>
            </section>

            {/* Action Buttons */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Radio size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">今すぐ聴く</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* YouTube Button (Primary) */}
                <a 
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-[#ff0000]/10 hover:bg-[#ff0000]/20 border border-[#ff0000]/30 hover:border-[#ff0000]/50 rounded-xl group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ff0000] flex items-center justify-center text-white shadow-lg">
                      <Youtube size={20} fill="currentColor" />
                    </div>
                    <div>
                      <div className="font-bold text-white">YouTube</div>
                      <div className="text-xs text-slate-400">Music Video / Audio</div>
                    </div>
                  </div>
                  <ExternalLink size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                </a>

                {/* Other Streaming Services */}
                {song.streamingPlatforms && song.streamingPlatforms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {song.streamingPlatforms.map((service, idx) => {
                       // Simple icon logic
                       let icon = <Music size={18} />;
                       let colorClass = "bg-slate-700";
                       
                       if (service.toLowerCase().includes('spotify')) colorClass = "bg-[#1DB954]";
                       if (service.toLowerCase().includes('apple')) colorClass = "bg-[#FA243C]";
                       if (service.toLowerCase().includes('amazon')) colorClass = "bg-[#00A8E1]";
                       if (service.toLowerCase().includes('line')) colorClass = "bg-[#06C755]";

                       return (
                        <a
                          key={idx}
                          href={getServiceUrl(service)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all hover:scale-[1.02]"
                        >
                          <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-white shrink-0`}>
                            {icon}
                          </div>
                          <span className="text-slate-300 font-medium text-sm">{service}</span>
                          <ExternalLink size={14} className="ml-auto text-slate-600" />
                        </a>
                       );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/50 rounded-xl text-slate-400 text-sm text-center border border-slate-700 border-dashed">
                    ストリーミング情報の取得に失敗しました
                  </div>
                )}
              </div>
            </section>
            
            {/* Tags/Mood */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
               <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
                 #{song.mood}
               </span>
               <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
                 #{song.genre}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};