export interface SongInput {
  id: string;
  title: string;
  artist: string;
}

export interface RecommendedSong {
  id?: string; // Optional as it comes from API without ID initially
  title: string;
  artist: string;
  genre: string;
  reason: string;
  mood: string;
  detailedDescription: string;
  streamingPlatforms: string[];
  feedback?: 'like' | 'skip' | 'none';
}

export interface RecommendationResponse {
  userTasteProfile: string;
  recommendations: RecommendedSong[];
}

export enum AppState {
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}