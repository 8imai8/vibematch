import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface Suggestion {
  primary: string;
  secondary?: string;
  fullData: any;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: { title: string; artist: string }) => void;
  placeholder: string;
  type: 'song' | 'artist';
  icon: React.ReactNode;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  type,
  icon
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (term: string) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const entity = type === 'artist' ? 'musicArtist' : 'song';
      // Use AllOrigins proxy to bypass CORS restrictions on iTunes API from browser
      const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=5&lang=ja_jp`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data.results) {
        const mapped: Suggestion[] = data.results.map((item: any) => ({
          primary: type === 'artist' ? item.artistName : item.trackName,
          secondary: type === 'artist' ? undefined : item.artistName,
          fullData: item
        }));
        
        // Filter out exact duplicates to keep the list clean
        const unique = mapped.filter((v, i, a) => 
          a.findIndex(t => t.primary === v.primary && t.secondary === v.secondary) === i
        );
        
        setSuggestions(unique);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);

    // Debounce API calls
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 400); // 400ms delay
  };

  const handleSelect = (suggestion: Suggestion) => {
    // If it's a song, we have both title and artist
    if (type === 'song' && onSelect) {
      onSelect({
        title: suggestion.primary,
        artist: suggestion.secondary || ''
      });
    } else {
      // Just update the current field
      onChange(suggestion.primary);
    }
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          {icon}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-slate-900 text-white pl-10 pr-10 py-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-slate-500 transition-all"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[100] w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar ring-1 ring-slate-700/50">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800/50 last:border-0 flex flex-col items-start text-left"
            >
              <span className="text-white font-medium text-sm truncate w-full">{item.primary}</span>
              {item.secondary && (
                <span className="text-slate-400 text-xs truncate w-full">{item.secondary}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};