export interface Gift {
  id: string;
  name: string;
  icon: string;
  price: number;
  percentChange: number;
  volume: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  description: string;
  lastUpdated: Date;
  historicalData: {
    timestamp: Date;
    price: number;
  }[];
}

export interface TrendData {
  rising: number;
  falling: number;
  neutral: number;
}

export type TimeFilter = 'today' | 'week' | '30days' | 'alltime';
export type ViewMode = 'compact' | 'expanded';