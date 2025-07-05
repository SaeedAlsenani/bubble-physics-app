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
  const [showSmallChanges, setShowSmallChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ تهيئة Telegram WebApp SDK
useEffect(() => {
  const timeout = setTimeout(() => {
    if (typeof WebApp !== "undefined") {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor("#0f172a");
      console.log("Telegram WebApp initialized safely:", WebApp);
    }
  }, 300); // نأخر التشغيل لضمان استقرار الواجهة

  return () => clearTimeout(timeout);
}, []);
    }

    // طباعة لمراجعة التهيئة
    console.log("Telegram WebApp initialized:", WebApp);
  }, []);

  const { gifts, trendData, lastUpdate } = useGiftData(timeFilter);

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
        className="bg-gray-900/95 backdrop-blur-sm p-4 text-center sticky top-0 z-20"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl font-bold text-center text-white">
          Gift Crystals
        </h1>
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

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900 opacity-40"></div>
      </div>
    </div>
  );
}

export default App;
