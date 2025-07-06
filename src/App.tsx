import React, { useState, useEffect } from 'react';
import WebApp from "@twa-dev/sdk";
import { motion } from 'framer-motion';
import Header from './components/Header';
import CrystalField from './components/CrystalField';
import GiftDetailModal from './components/GiftDetailModal';
import giftsData from './gifts.json'; // استيراد البيانات الجاهزة
import { Gift, TimeFilter, TrendData } from './types/Gift';

// تحويل التواريخ من النص إلى كائنات Date
const processedGifts = giftsData.map(gift => ({
  ...gift,
  lastUpdated: new Date(gift.lastUpdated),
  historicalData: gift.historicalData.map(item => ({
    ...item,
    timestamp: new Date(item.timestamp)
  }))
})) as Gift[];

// حساب بيانات الاتجاهات
const calculateTrendData = (gifts: Gift[]): TrendData => {
  const rising = gifts.filter(g => g.percentChange > 0).length;
  const falling = gifts.filter(g => g.percentChange < 0).length;
  const neutral = gifts.filter(g => g.percentChange === 0).length;
  
  return { rising, falling, neutral };
};

function App() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [showSmallChanges, setShowSmallChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // استخدام البيانات الجاهزة بدلاً من useGiftData
  const gifts = processedGifts;
  const trendData = calculateTrendData(gifts);
  const lastUpdate = new Date().toLocaleTimeString();

  // بقية الكود بدون تغيير...
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor("#0f172a");
      console.log("✅ Telegram WebApp initialized");
    }
  }, []);

  const handleCrystalClick = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGift(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* App Title */}
      <motion.div
        className="bg-gray-900/95 backdrop-blur-sm py-4 px-6 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl font-bold text-center">Crystal Market</h1>
      </motion.div>

      {/* Header */}
      <Header
        trendData={trendData}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        showSmallChanges={showSmallChanges}
        onToggleSmallChanges={() => setShowSmallChanges(!showSmallChanges)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
      />

      {/* Crystal Field */}
      <CrystalField
        gifts={gifts}
        onCrystalClick={handleCrystalClick}
        searchQuery={searchQuery}
        showSmallChanges={showSmallChanges}
      />

      {/* Gift Detail Modal */}
      <GiftDetailModal
        gift={selectedGift}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;
