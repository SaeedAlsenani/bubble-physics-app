import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Crystal from './Crystal';
import { Gift } from '../types/Gift';

interface CrystalPosition {
  id: string;
  x: number;
  y: number;
  size: number;
  zIndex: number;
  isDragging: boolean;
}

const CrystalField: React.FC<{
  gifts: Gift[];
  onCrystalClick: (gift: Gift) => void;
  searchQuery: string;
  showSmallChanges: boolean;
}> = ({ gifts, onCrystalClick, searchQuery, showSmallChanges }) => {
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const [crystalPositions, setCrystalPositions] = useState<CrystalPosition[]>([]);
  const repulsionForce = 1.5;
  const minDistance = 30;
  const edgeMargin = 20;

  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSmallChanges = showSmallChanges || Math.abs(gift.percentChange) >= 2;
      return matchesSearch && matchesSmallChanges;
    });
  }, [gifts, searchQuery, showSmallChanges]);

  const getCrystalSize = useCallback((gift: Gift) => {
    const baseSize = 40;
    const changeMultiplier = Math.min(Math.abs(gift.percentChange) / 10, 2);
    const volumeMultiplier = Math.min(gift.volume / 1000, 1.5);
    const rarityMultiplier = {
      common: 1,
      rare: 1.2,
      epic: 1.4,
      legendary: 1.6
    }[gift.rarity];
    
    return Math.max(20, Math.min(150, 
      baseSize + changeMultiplier * 15 + volumeMultiplier * 10 + rarityMultiplier * 5
    ));
  }, []);

  const generateInitialPositions = useCallback(() => {
    const container = fieldRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const positions: CrystalPosition[] = [];
    const maxAttempts = 500;

    filteredGifts.forEach((gift, index) => {
      const size = getCrystalSize(gift);
      let positionFound = false;
      let attempts = 0;
      let x = 0, y = 0;

      while (!positionFound && attempts < maxAttempts) {
        x = edgeMargin + size / 2 + Math.random() * (width - size - 2 * edgeMargin);
        y = edgeMargin + size / 2 + Math.random() * (height - size - 2 * edgeMargin);

        positionFound = positions.every(pos => {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minAllowed = (size + pos.size) / 2 + minDistance;
          return distance >= minAllowed;
        });

        attempts++;
      }

      if (!positionFound) return;

      positions.push({
        id: gift.id,
        x,
        y,
        size,
        zIndex: index,
        isDragging: false
      });
    });

    setCrystalPositions(positions);
  }, [filteredGifts, getCrystalSize]);

  const applyRepulsion = useCallback(() => {
    setCrystalPositions(prev => {
      const newPos = [...prev];
      const width = fieldRef.current?.clientWidth || window.innerWidth;
      const height = fieldRef.current?.clientHeight || window.innerHeight;

      newPos.forEach((pos, i) => {
        if (pos.isDragging) return;

        let fx = 0, fy = 0;

        newPos.forEach((other, j) => {
          if (i === j) return;
          const dx = other.x - pos.x;
          const dy = other.y - pos.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const minAllowed = (pos.size + other.size) / 2 + minDistance;
          if (d < minAllowed) {
            const F = repulsionForce * (minAllowed - d) / (d || 1);
            fx -= dx * F;
            fy -= dy * F;
          }
        });

        let nx = pos.x + fx;
        let ny = pos.y + fy;

        nx = Math.max(pos.size / 2 + edgeMargin, Math.min(width - pos.size / 2 - edgeMargin, nx));
        ny = Math.max(pos.size / 2 + edgeMargin, Math.min(height - pos.size / 2 - edgeMargin, ny));

        newPos[i] = { ...pos, x: nx, y: ny };
      });

      return newPos;
    });
  }, [repulsionForce, minDistance]);

  // توزيع أولي بدون حركة مستمرة
  useEffect(() => {
    generateInitialPositions();
    if (typeof ResizeObserver !== 'undefined' && fieldRef.current) {
      const obs = new ResizeObserver(generateInitialPositions);
      obs.observe(fieldRef.current);
      return () => obs.disconnect();
    }
  }, [generateInitialPositions]);

  // تطبيق النفور مرة واحدة فقط
  useEffect(() => {
    applyRepulsion();
  }, [applyRepulsion]);

  const handleDragStart = useCallback((id: string) => {
    setCrystalPositions(prev =>
      prev.map(p => p.id === id ? { ...p, isDragging: true, zIndex: prev.length } : p)
    );
  }, []);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setCrystalPositions(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, isDragging: false, x, y, zIndex: prev.length } : p);
      setTimeout(applyRepulsion, 100);
      return updated;
    });
  }, [applyRepulsion]);

  return (
    <motion.div
      ref={fieldRef}
      className="relative w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(239,68,68,0.03),transparent_70%)]" />

      {crystalPositions.map(pos => {
        const gift = filteredGifts.find(g => g.id === pos.id);
        if (!gift) return null;
        return (
          <Crystal
            key={gift.id}
            gift={gift}
            size={pos.size}
            position={{ x: pos.x, y: pos.y }}
            onClick={() => onCrystalClick(gift)}
            onDragStart={() => handleDragStart(gift.id)}
            onDragEnd={(x, y) => handleDragEnd(gift.id, x, y)}
            zIndex={pos.zIndex}
            isDragging={pos.isDragging}
          />
        );
      })}

      {filteredGifts.length === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center space-y-4">
            <motion.div animate={{ y: [-10, 0, -10] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl">
              💎
            </motion.div>
            <div className="text-gray-400 text-lg">No crystals found</div>
            <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CrystalField;
