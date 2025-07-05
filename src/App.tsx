import React, { useState, useEffect } from 'react';
import WebApp from "@twa-dev/sdk";
import { motion } from 'framer-motion';
import Header from './components/Header';
import CrystalField from './components/CrystalField';
import GiftDetailModal from './components/GiftDetailModal';
import { useGiftData } from './hooks/useGiftData';
import { Gift, TimeFilter } from './types/Gift';

function App() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const [showSmallChanges, setShowSmallChanges] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { gifts, trendData, lastUpdate } = useGiftData();

  // ✅ تهيئة Telegram WebApp SDK
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor("#0f172a");
      console.log("✅ Telegram WebApp initialized.");
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* App Title */}
      <motion.div
        className="bg-gray-900/95 backdrop-blur-lg p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl font-bold text-center">Gift Crystals</h1>
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
