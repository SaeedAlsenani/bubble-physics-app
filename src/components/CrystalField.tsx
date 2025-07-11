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
  const [containerReady, setContainerReady] = useState(false);
  const repulsionForce = 1.5;
  const minDistance = 30;
  const edgeMargin = 20;

  // فلترة الهدايا مع حماية ضد null/undefined
  const filteredGifts = useMemo(() => {
    return (gifts || []).filter(gift => {
      if (!gift) return false;
      const matchesSearch = gift.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const matchesSmallChanges = showSmallChanges || (gift.changePercent ?? 0) >= 1;
      return matchesSearch && matchesSmallChanges;
    });
  }, [gifts, searchQuery, showSmallChanges]);

  // حساب الحجم مع قيم افتراضية آمنة
  const getCrystalSize = useCallback((gift: Gift) => {
    const baseSize = 40;
    const changePercent = Math.abs(gift.changePercent ?? 0);
    const volume = gift.volume ?? 0;
    
    const changeMultiplier = Math.min(changePercent / 10, 3);
    const volumeMultiplier = Math.min(volume / 1000000, 3);
    const rarityMultiplier = {
      common: 1,
      rare: 1.2,
      epic: 1.4,
      legendary: 1.6
    }[gift.rarity || 'common'];

    return Math.max(20, Math.min(150,
      baseSize + changeMultiplier * 15 + volumeMultiplier * 10
    ));
  }, []);

  // توليد المواقع مع تحقق مكثف من الحاوية
  const generateInitialPositions = useCallback(() => {
    const container = fieldRef.current;
    if (!container || !container.clientWidth || !container.clientHeight) {
      setContainerReady(false);
      return;
    }

    setContainerReady(true);
    const width = container.clientWidth;
    const height = container.clientHeight;
    const positions: CrystalPosition[] = [];
    const maxAttempts = 500;

    filteredGifts.forEach((gift, index) => {
      if (!gift?.id) return;
      
      const size = getCrystalSize(gift);
      let positionFound = false;
      let attempts = 0;
      let x = 0, y = 0;

      while (!positionFound && attempts < maxAttempts) {
        x = edgeMargin + size / 2 + Math.random() * (width - size - edgeMargin * 2);
        y = edgeMargin + size / 2 + Math.random() * (height - size - edgeMargin * 2);

        positionFound = positions.every(pos => {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minAllowed = (size + pos.size) / 2 + minDistance;
          return distance >= minAllowed;
        });

        attempts++;
      }

      if (positionFound) {
        positions.push({
          id: gift.id,
          x,
          y,
          size,
          zIndex: index,
          isDragging: false
        });
      }
    });

    setCrystalPositions(positions);
  }, [filteredGifts, getCrystalSize]);

  // تطبيق التنافر مع حدود آمنة
  const applyRepulsion = useCallback(() => {
    if (!fieldRef.current) return;

    setCrystalPositions(prev => {
      const newPos = [...prev];
      const width = fieldRef.current?.clientWidth || 800;
      const height = fieldRef.current?.clientHeight || 600;

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
            const F = repulsionForce * (minAllowed - d) / d;
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

  // تأثيرات التهيئة
  useEffect(() => {
    const init = () => {
      generateInitialPositions();
      if (typeof ResizeObserver !== 'undefined' && fieldRef.current) {
        const obs = new ResizeObserver(() => {
          generateInitialPositions();
          setTimeout(applyRepulsion, 100);
        });
        obs.observe(fieldRef.current);
        return () => obs.disconnect();
      }
    };

    const timer = setTimeout(init, 100);
    return () => clearTimeout(timer);
  }, [generateInitialPositions, applyRepulsion]);

  // طبقة حماية إضافية
  if (!containerReady) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white">جاري تحميل البلورات...</div>
      </div>
    );
  }

  return (
    <motion.div
      ref={fieldRef}
      className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-blue-900 to-purple-900 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* طبقات الخلفية */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(173,216,230,0.15)_0%,transparent_50%)]" />

      {/* عرض البلورات مع تحقق من وجودها */}
      {crystalPositions.map(pos => {
        const gift = filteredGifts.find(g => g?.id === pos.id);
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

      {/* رسالة عندما لا توجد نتائج */}
      {filteredGifts.length === 0 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center space-y-4">
            <motion.div 
              animate={{ y: [-10, 0, -10] }} 
              transition={{ duration: 2, repeat: Infinity }}
            >
              💎
            </motion.div>
            <div className="text-gray-400 text-xl">لا توجد بلورات</div>
            <div className="text-gray-500 text-sm">حاول تعديل البحث أو الفلتر</div>
          </div>
        </motion.div>
      )}

      {/* طبقة تتبع للأغراض التنموية */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
          {filteredGifts.length} بلورة | {containerReady ? 'جاهز' : 'تحميل'}
        </div>
      )}
    </motion.div>
  );
};

export default CrystalField;
