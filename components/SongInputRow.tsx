import React from 'react';
import { SongInput } from '../types';
import { Trash2, Music, Mic2 } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

interface SongInputRowProps {
  song: SongInput;
  index: number;
  onChange: (id: string, field: 'title' | 'artist', value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

export const SongInputRow: React.FC<SongInputRowProps> = ({
  song,
  index,
  onChange,
  onRemove,
  canRemove,
}) => {
  // Helper to handle song selection (fills both title and artist)
  const handleSongSelect = (selection: { title: string; artist: string }) => {
    onChange(song.id, 'title', selection.title);
    onChange(song.id, 'artist', selection.artist);
  };

  return (
    <div className="group relative flex flex-col md:flex-row gap-3 items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-indigo-500/10 focus-within:z-50 hover:z-40">
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-500 group-hover:h-1/2 transition-all duration-300 rounded-r-full"></div>
      
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-sm">
        {index + 1}
      </div>

      <div className="flex-1 w-full z-20">
        <AutocompleteInput
          type="song"
          value={song.title}
          onChange={(val) => onChange(song.id, 'title', val)}
          onSelect={handleSongSelect}
          placeholder="曲名 (例: 群青)"
          icon={<Music className="h-4 w-4 text-slate-500" />}
        />
      </div>

      <div className="flex-1 w-full z-10">
         <AutocompleteInput
          type="artist"
          value={song.artist}
          onChange={(val) => onChange(song.id, 'artist', val)}
          placeholder="アーティスト (例: YOASOBI)"
          icon={<Mic2 className="h-4 w-4 text-slate-500" />}
        />
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(song.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors md:ml-2"
          title="削除"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};