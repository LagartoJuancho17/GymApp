import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { motion } from 'motion/react';

export function SecondaryTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      const startTime = Date.now() - elapsedTime;
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsedTime]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700/50 rounded-2xl p-3 flex items-center justify-between gap-4 shadow-lg shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#38BDF8]/20 flex items-center justify-center">
          <Timer size={16} className="text-[#38BDF8]" />
        </div>
        <span className="text-white font-mono font-medium text-lg min-w-[5ch]">
          {formatTime(elapsedTime)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={toggle}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 transition-colors text-white"
        >
          {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <button 
          onClick={reset}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors text-gray-400"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
