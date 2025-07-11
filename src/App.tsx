import React, { useState, useEffect, useMemo } from 'react';
import WebApp from "@twa-dev/sdk";
import { motion } from 'framer-motion';
import Header from './components/Header';
import CrystalField from './components/CrystalField';
import GiftDetailModal from './components/GiftDetailModal';
import giftsData from './gifts.json';
import { Gift, TimeFilter, TrendData } from './types/Gift';

const App = () => {
  // States
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [showSmallChanges, setShowSmallChanges] = useState(true); // تم التعديل ليكون true افتراضيًا
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Process data
  const processedGifts = useMemo(() => giftsData.map(gift => ({
    ...gift,
    lastUpdated: new Date(gift.lastUpdated),
    historicalData: gift.historicalData?.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    })) || []
  })), []);

  // Filter gifts
  const gifts = useMemo(() => {
    return processedGifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSize = showSmallChanges || Math.abs(gift.percentChange) >= 1;
      return matchesSearch && matchesSize;
    });
  }, [processedGifts, searchQuery, showSmallChanges]);

  const trendData = calculateTrendData(gifts);
  const lastUpdate = new Date().toLocaleTimeString();

  // Telegram WebApp Init
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor("#0f172a");
    }
  }, []);

  // Handlers
  const handleCrystalClick = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header Section */}
      <motion.div className="bg-gray-900/95 py-4 px-6">
        <h1 className="text-xl font-bold text-center">Crystal Market</h1>
      </motion.div>

      <Header
        trendData={trendData}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        showSmallChanges={showSmallChanges}
        onToggleSmallChanges={() => setShowSmallChanges(!showSmallChanges)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastUpdate={lastUpdate}
      />

      {/* Main Content */}
      <div className="flex-1 relative min-h-[70vh]">
        <CrystalField
          gifts={gifts}
          onCrystalClick={handleCrystalClick}
        />
      </div>

      <GiftDetailModal
        gift={selectedGift}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

// Helper function
const calculateTrendData = (gifts: Gift[]): TrendData => ({
  rising: gifts.filter(g => g.percentChange > 0).length,
  falling: gifts.filter(g => g.percentChange < 0).length,
  neutral: gifts.filter(g => g.percentChange === 0).length
});

export default App;
