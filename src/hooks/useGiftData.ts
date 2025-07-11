import { useState, useEffect } from 'react';
import { Gift, TrendData, TimeFilter } from '../types/Gift';
import { mockGifts } from '../data/mockGifts';

export const useGiftData = (timeFilter: TimeFilter) => {
  const [gifts, setGifts] = useState<Gift[]>(mockGifts);
  const [trendData, setTrendData] = useState<TrendData>({ rising: 0, falling: 0, neutral: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGifts(prevGifts => 
        prevGifts.map(gift => {
          const randomChange = (Math.random() - 0.5) * 2; // -1 to 1
          const newPercentChange = gift.percentChange + randomChange;
          const newPrice = Math.max(1, gift.price * (1 + randomChange / 100));
          
          return {
            ...gift,
            percentChange: Number(newPercentChange.toFixed(2)),
            price: Number(newPrice.toFixed(2)),
            lastUpdated: new Date()
          };
        })
      );
      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate trend data
  useEffect(() => {
    const rising = gifts.filter(gift => gift.percentChange > 0).length;
    const falling = gifts.filter(gift => gift.percentChange < 0).length;
    const neutral = gifts.filter(gift => gift.percentChange === 0).length;
    
    setTrendData({ rising, falling, neutral });
  }, [gifts]);

  const filteredGifts = gifts.filter(gift => {
    // Apply time filter logic here
    return true; // For now, return all gifts
  });

  return { gifts: filteredGifts, trendData, lastUpdate };
};