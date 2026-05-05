import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { ChevronRight, Lock, Unlock } from 'lucide-react';

interface SlideToUnlockProps {
  onUnlock: () => void;
  text?: string;
}

export function SlideToUnlock({ onUnlock, text = "Desliza para terminar" }: SlideToUnlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const thumbWidth = 56; // 14 spacing * 4 = 56px approx
  
  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Opacity of the text decreases as we slide
  const textOpacity = useTransform(x, [0, width - thumbWidth], [1, 0]);

  const handleDragEnd = async (e: any, info: any) => {
    const maxX = width - thumbWidth;
    if (info.offset.x >= maxX * 0.8) {
      // Trigger unlock
      await controls.start({ x: maxX });
      onUnlock();
    } else {
      // Snap back
      controls.start({ x: 0 });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-14 bg-neutral-800 rounded-full flex items-center shadow-inner overflow-hidden border border-neutral-700 select-none"
    >
      <motion.span 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium text-sm pointer-events-none"
      >
        <Lock size={16} className="mr-2" />
        {text}
      </motion.span>
      
      {width > 0 && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: width - thumbWidth }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          className="absolute left-1 h-12 w-12 bg-gym-lime rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10"
        >
          <ChevronRight className="text-black" size={24} />
        </motion.div>
      )}
    </div>
  );
}
