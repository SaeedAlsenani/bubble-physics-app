import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useAnimation } from 'framer-motion';
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
  // الحالة والمراجع
  const fieldRef = React.useRef<HTMLDivElement>(null);
  const [crystalPositions, setCrystalPositions] = useState<CrystalPosition[]>([]);
  const repulsionForce = 1.5; // قوة التنافر بين البلورات
  const minDistance = 30; // الحد الأدنى للمسافة بين المراكز
  const edgeMargin = 20; // الهامش من حواف الشاشة

  // فلترة الهدايا
  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSmallChanges = showSmallChanges || Math.abs(gift.percentChange) >= 2;
      return matchesSearch && matchesSmallChanges;
    });
  }, [gifts, searchQuery, showSmallChanges]);

  // حساب حجم البلورة مع الحدود الجديدة
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
      baseSize + (changeMultiplier * 15) + (volumeMultiplier * 10) + (rarityMultiplier * 5)
    ));
  }, []);

  // توليد مواقع أولية مع منع التصادم
  const generateInitialPositions = useCallback(() => {
    const container = fieldRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const positions: CrystalPosition[] = [];

    // خوارزمية توزيع متقدمة
    const maxAttempts = 100;
    const gridSize = 50; // حجم خلية الشبكة

    filteredGifts.forEach((gift, index) => {
      const size = getCrystalSize(gift);
      let positionFound = false;
      let attempts = 0;
      let x = 0, y = 0;

      while (!positionFound && attempts < maxAttempts) {
        // تجربة مواقع عشوائية
        x = edgeMargin + size/2 + Math.random() * (width - size - 2*edgeMargin);
        y = edgeMargin + size/2 + Math.random() * (height - size - 2*edgeMargin);
        
        // التحقق من التصادم مع البلورات الأخرى
        positionFound = positions.every(pos => {
          const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
          const minAllowedDistance = (size + pos.size)/2 + minDistance;
          return distance >= minAllowedDistance;
        });

        attempts++;
      }

      if (positionFound || attempts >= maxAttempts) {
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

  // تطبيق قوة التنافر
  const applyRepulsion = useCallback(() => {
    setCrystalPositions(prevPositions => {
      const newPositions = [...prevPositions];
      const fieldWidth = fieldRef.current?.clientWidth || window.innerWidth;
      const fieldHeight = fieldRef.current?.clientHeight || window.innerHeight;

      newPositions.forEach((pos, i) => {
        if (pos.isDragging) return; // لا تنطبق على البلورات المسحوبة

        let totalForceX = 0;
        let totalForceY = 0;

        // حساب القوى من البلورات الأخرى
        newPositions.forEach((otherPos, j) => {
          if (i === j) return;

          const dx = otherPos.x - pos.x;
          const dy = otherPos.y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistanceBetween = (pos.size + otherPos.size)/2 + minDistance;

          if (distance < minDistanceBetween) {
            const force = repulsionForce * (minDistanceBetween - distance) / distance;
            totalForceX -= dx * force;
            totalForceY -= dy * force;
          }
        });

        // تطبيق القوى مع مراعاة الحدود
        let newX = pos.x + totalForceX;
        let newY = pos.y + totalForceY;

        // منع الخروج من الحدود
        newX = Math.max(pos.size/2 + edgeMargin, Math.min(fieldWidth - pos.size/2 - edgeMargin, newX));
        newY = Math.max(pos.size/2 + edgeMargin, Math.min(fieldHeight - pos.size/2 - edgeMargin, newY));

        newPositions[i] = { ...pos, x: newX, y: newY };
      });

      return newPositions;
    });
  }, [repulsionForce, minDistance]);

  // تحديث المواقع عند التغييرات
  useEffect(() => {
    generateInitialPositions();
    const resizeObserver = new ResizeObserver(() => generateInitialPositions());
    if (fieldRef.current) resizeObserver.observe(fieldRef.current);
    return () => resizeObserver.disconnect();
  }, [generateInitialPositions]);

  // حلقة التنافر المستمرة
  useEffect(() => {
    const repulsionInterval = setInterval(applyRepulsion, 50);
    return () => clearInterval(repulsionInterval);
  }, [applyRepulsion]);

  // معالجة بدء السحب
  const handleDragStart = useCallback((id: string) => {
    setCrystalPositions(prev => 
      prev.map(pos => 
        pos.id === id ? { ...pos, isDragging: true, zIndex: 999 } : pos
      )
    );
  }, []);

  // معالجة انتهاء السحب
  const handleDragEnd = useCallback((id: string, newX: number, newY: number) => {
    setCrystalPositions(prev => {
      const updated = prev.map(pos => 
        pos.id === id 
          ? { ...pos, x: newX, y: newY, isDragging: false, zIndex: prev.length }
          : pos
      );
      
      // تطبيق تنافر فوري بعد الإفلات
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
      {/* تأثيرات خلفية */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(239,68,68,0.03),transparent_70%)]" />
      
      {/* عرض البلورات */}
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
            onDragStart={() => handleDragStart(gift.id)}
            onDragEnd={(x, y) => handleDragEnd(gift.id, x, y)}
            zIndex={position.zIndex}
            isDragging={position.isDragging}
          />
        );
      })}
      
      {/* حالة عدم وجود نتائج */}
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
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl"
            >
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
