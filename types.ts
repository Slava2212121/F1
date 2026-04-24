export interface Driver {
  id: string;
  name: string;
  team: string;
  number: number;
  points: number;
  image: string;
  countryCode: string;
  countryName?: string;
  careerHistory?: string;
  wins?: number;
  grandsPrix?: number;
  championships?: number;
  birthDate?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  category: 'Breaking' | 'Tech' | 'Interview' | 'Rumor';
  imageUrl: string;
}

export interface LiveUpdate {
  lap: number;
  message: string;
  flag: 'GREEN' | 'YELLOW' | 'RED' | 'SC' | 'VSC' | 'CHEQUERED';
  timestamp: number;
}

export enum ViewState {
  CALENDAR = 'CALENDAR',
  DRIVERS = 'DRIVERS',
  CONSTRUCTORS = 'CONSTRUCTORS',
  STREAMS = 'STREAMS',
  NEWS = 'NEWS',
  FAVORITES = 'FAVORITES',
  PREDICTIONS = 'PREDICTIONS',
  ADMIN = 'ADMIN'
}

export interface RaceSession {
  name: string;
  track: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  currentLap?: number;
  totalLaps?: number;
}