import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Star, Eye, Heart, BarChart3, Gem } from 'lucide-react';
import { Gift } from '../types/Gift';

interface GiftDetailModalProps {
  gift: Gift | null;
  isOpen: boolean;
  onClose: () => void;
}

const GiftDetailModal: React.FC<GiftDetailModalProps> = ({ gift, isOpen, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!gift) return null;

  const isPositive = gift.percentChange > 0;
  const isNegative = gift.percentChange < 0;

  const rarityColors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl border-t border-gray-700 z-50 max-h-[80vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{gift.icon}</div>
                  <div>
                    <h2 id="modal-title" className="text-xl font-bold text-white">{gift.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-sm font-medium ${rarityColors[gift.rarity]}`}>
                        {gift.rarity.charAt(0).toUpperCase() + gift.rarity.slice(1)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">{gift.category}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <motion.div 
                className="bg-gray-800/50 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gem className="w-5 h-5 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{gift.price.toFixed(2)}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    isPositive ? 'text-green-400' : 
                    isNegative ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> :
                     isNegative ? <TrendingDown className="w-4 h-4" /> : null}
                    <span className="font-bold">
                      {gift.percentChange > 0 ? '+' : ''}{gift.percentChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="grid grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-gray-800/30 rounded-lg p-3 text-center hover:bg-gray-800/50 transition-colors">
                  <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">{gift.volume}</div>
                  <div className="text-xs text-gray-400">Volume</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 text-center hover:bg-gray-800/50 transition-colors">
                  <BarChart3 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">7d</div>
                  <div className="text-xs text-gray-400">Period</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-3 text-center hover:bg-gray-800/50 transition-colors">
                  <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-white">4.8</div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Price History</h3>
                  <div className="flex space-x-2">
                    {['6h', '1d', '7d', '30d'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          selectedPeriod === period 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-32 bg-gray-700/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-500" />
                  <span className="ml-2 text-gray-500">Chart Coming Soon</span>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/30 rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{gift.description}</p>
              </motion.div>

              <motion.div 
                className="flex space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Buy Gift
                </motion.button>
                <motion.button
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-5 h-5 text-gray-300" />
                </motion.button>
                <motion.button
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Star className="w-5 h-5 text-gray-300" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(GiftDetailModal);
