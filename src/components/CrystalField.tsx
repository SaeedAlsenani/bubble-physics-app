import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Crystal from './Crystal';
import { Gift } from '../types/Gift';

interface CrystalFieldProps {
  gifts: Gift[];
  onCrystalClick: (gift: Gift) => void;
  searchQuery: string;
  showSmallChanges: boolean;
}

interface CrystalPosition {
  id: string;
  x: number;
  y: number;
  size: number;
}

const CrystalField: React.FC<CrystalFieldProps> = ({ 
  gifts, 
  onCrystalClick, 
  searchQuery, 
  showSmallChanges 
}) => {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const [crystalPositions, setCrystalPositions] = useState<CrystalPosition[]>([]);
  const [fieldSize, setFieldSize] = useState({ width: 0, height: 0 });

  // Filter gifts with memoization
  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSmallChanges = showSmallChanges || Math.abs(gift.percentChange) >= 2;
      return matchesSearch && matchesSmallChanges;
    });
  }, [gifts, searchQuery, showSmallChanges]);

  // Calculate crystal size (20px to 150px range)
  const getCrystalSize = useCallback((gift: Gift) => {
    const baseSize = 60;
    const changeMultiplier = Math.min(Math.abs(gift.percentChange) / 10, 2);
    const volumeMultiplier = Math.min(gift.volume / 1000, 1.5);
    const rarityMultiplier = {
      common: 1,
      rare: 1.2,
      epic: 1.4,
      legendary: 1.6
    }[gift.rarity];
    
    return Math.max(20, Math.min(150, 
      baseSize + (changeMultiplier * 15) + (volumeMultiplier * 10) + (rarityMultiplier * 5)
    ));
  }, []);

  // Generate non-overlapping positions
  const generatePositions = useCallback(() => {
    const container = fieldRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    setFieldSize({ width, height });

    const positions: CrystalPosition[] = [];
    const margin = 50;
    const maxAttempts = 100;
    
    // Sort by size (largest first) for better placement
    const sortedGifts = [...filteredGifts].sort((a, b) => 
      getCrystalSize(b) - getCrystalSize(a)
    );

    sortedGifts.forEach(gift => {
      const size = getCrystalSize(gift);
      let positionFound = false;
      let attempts = 0;
      let x = 0, y = 0;

      while (!positionFound && attempts < maxAttempts) {
        x = margin + Math.random() * (width - 2 * margin);
        y = margin + Math.random() * (height - 2 * margin);
        
        positionFound = positions.every(pos => {
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          return distance >= (size + pos.size) / 2 + 30; // 30px minimum gap
        });

        attempts++;
      }

      if (positionFound) {
        positions.push({ id: gift.id, x, y, size });
      }
    });

    setCrystalPositions(positions);
  }, [filteredGifts, getCrystalSize]);

  // Update positions on drag end
  const handleDragEnd = useCallback((id: string, newX: number, newY: number) => {
    setCrystalPositions(prev => 
      prev.map(pos => 
        pos.id === id ? { ...pos, x: newX, y: newY } : pos
      )
    );
  }, []);

  // Initialize and handle resize
  useEffect(() => {
    generatePositions();
    const handleResize = () => generatePositions();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generatePositions]);

  return (
    <motion.div
      ref={fieldRef}
      className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(239,68,68,0.03),transparent_70%)]" />
      
      {/* Crystals - all with same z-index (no elevation change) */}
      {crystalPositions.map((position) => {
        const gift = filteredGifts.find(g => g.id === position.id);
        if (!gift) return null;
        
        return (
          <Crystal
            key={gift.id}
            gift={gift}
            size={position.size}
            position={{ x: position.x, y: position.y }}
            onClick={() => onCrystalClick(gift)}
            onDragEnd={(x, y) => handleDragEnd(gift.id, x, y)}
            isDragging={false} // Visual appearance remains consistent
          />
        );
      })}
      
      {/* Empty state */}
      {filteredGifts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">💎</div>
            <div className="text-gray-400 text-lg">No crystals found</div>
            <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CrystalField;
