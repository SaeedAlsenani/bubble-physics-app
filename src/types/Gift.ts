// types/Gift.ts

export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
  percentChange: number;
  volume: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TrendData {
  rising: number;
  falling: number;
  neutral: number;
}

export type TimeFilter = 'today' | 'week' | '30days';
export type ViewMode = 'compact' | 'expanded';
