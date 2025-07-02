import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import CrystalField from './components/CrystalField';
import GiftDetailModal from './components/GiftDetailModal';
import { useGiftData } from './hooks/useGiftData';
import { Gift, TimeFilter } from './types/Gift';

function App() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [showSmallChanges, setShowSmallChanges] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    // In a real app, this would trigger a data refresh
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* App Title */}
      <motion.div 
        className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl font-bold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
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
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-900/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-red-900/5 to-transparent" />
      </div>
    </div>
  );
}

export default App;