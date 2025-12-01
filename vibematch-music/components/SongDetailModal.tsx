import React, { useEffect, useRef } from 'react';
import { RecommendedSong } from '../types';
import { X, ExternalLink, Music, Disc, Radio, PlayCircle, AlertCircle } from 'lucide-react';

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
  
  // Construct search query for YouTube Embed
  // Removing "audio" suffix to broaden search to MVs and Lyric videos which are less likely to be blocked than "Topic" tracks
  const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube.com/embed?listType=search&list=${searchQuery}&autoplay=0&controls=1&rel=0&origin=${origin}`;

  // Fallback URL
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} ${song.artist}`)}`;

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
        className="relative w-full max-w-3xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-700 rounded-full text-white transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto custom-scrollbar">
          {/* Header Image Area */}
          <div className="relative h-48 sm:h-64 w-full">
            <img 
              src={imageUrl} 
              alt={song.title} 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/80 text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                  {song.genre}
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-600">
                   {song.mood}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg mb-1">{song.title}</h2>
              <p className="text-xl text-slate-200 font-medium drop-shadow-md">{song.artist}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* YouTube Player Section */}
            <section className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-500">
                  <PlayCircle size={24} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">プレビュー再生</h3>
                </div>
              </div>
              
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black relative group z-0">
                <iframe
                  width="100%"
                  height="100%"
                  src={embedUrl}
                  title={`${song.title} - ${song.artist}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
              
              <div className="mt-3 flex justify-end">
                <a 
                  href={youtubeSearchUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 rounded-lg text-xs font-medium transition-all"
                >
                  <AlertCircle size={14} />
                  うまく再生されない場合はYouTubeで直接開く
                  <ExternalLink size={12} />
                </a>
              </div>
            </section>

            {/* Detailed Description */}
            <section>
              <div className="flex items-center gap-2 mb-3 text-indigo-400">
                <Disc size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">楽曲解説</h3>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                <p className="text-slate-300 leading-relaxed text-lg">
                  {song.detailedDescription || song.reason}
                </p>
              </div>
            </section>

            {/* Other Streaming Services */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Radio size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">他のサービスで聴く</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {song.streamingPlatforms && song.streamingPlatforms.length > 0 ? (
                  song.streamingPlatforms.map((service, idx) => {
                     // Simple icon logic
                     let icon = <Music size={18} />;
                     let colorClass = "bg-slate-700 group-hover:bg-slate-600";
                     let textColor = "text-slate-300 group-hover:text-white";
                     
                     if (service.toLowerCase().includes('spotify')) colorClass = "bg-[#1DB954] text-white";
                     if (service.toLowerCase().includes('apple')) colorClass = "bg-[#FA243C] text-white";
                     if (service.toLowerCase().includes('amazon')) colorClass = "bg-[#00A8E1] text-white";
                     if (service.toLowerCase().includes('line')) colorClass = "bg-[#06C755] text-white";
                     if (service.toLowerCase().includes('youtube music')) colorClass = "bg-[#FF0000] text-white";

                     return (
                      <a
                        key={idx}
                        href={getServiceUrl(service)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:border-slate-600"
                      >
                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center shrink-0 transition-colors`}>
                          {icon}
                        </div>
                        <span className={`font-medium text-sm transition-colors ${textColor}`}>{service}</span>
                        <ExternalLink size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
                      </a>
                     );
                  })
                ) : (
                  <div className="col-span-full p-4 bg-slate-800/50 rounded-xl text-slate-400 text-sm text-center border border-slate-700 border-dashed">
                    その他の配信リンクは見つかりませんでした
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};