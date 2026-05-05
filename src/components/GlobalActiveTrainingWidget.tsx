import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, ArrowRight } from 'lucide-react';
import { useAppContext } from '../store';
import { formatTime } from '../lib/utils';
import { SlideToUnlock } from './SlideToUnlock';

export function GlobalActiveTrainingWidget() {
  const { isTrainingGlobal, trainingStartTimeGlobal, activeRoutineId, routines, stopTrainingGlobal, completedExercises, addCompletedWorkout } = useAppContext();
  const [elapsed, setElapsed] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTrainingGlobal && trainingStartTimeGlobal) {
      interval = setInterval(() => {
        setElapsed(Date.now() - trainingStartTimeGlobal);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTrainingGlobal, trainingStartTimeGlobal]);

  const activeRoutine = routines.find(r => r.id === activeRoutineId);

  const handleStop = () => {
    if (activeRoutine) {
      // Check if all exercises were completed
      const allDone = activeRoutine.exercises.length > 0 && activeRoutine.exercises.every(ex => completedExercises.includes(ex.id));
      if (allDone) {
        setShowSuccessModal(true);
        // We defer stopTrainingGlobal until the modal is closed
        return;
      }
    }

    stopTrainingGlobal();
    setIsExpanded(false);
    setIsUnlocked(false);
  };

  const handleCloseSuccess = () => {
    if (activeRoutine) {
      addCompletedWorkout({
        routineId: activeRoutine.id,
        routineName: activeRoutine.name,
        date: new Date().toISOString()
      });
    }
    setShowSuccessModal(false);
    stopTrainingGlobal();
    setIsExpanded(false);
    setIsUnlocked(false);
  };

  if (!isTrainingGlobal && !showSuccessModal) return null;

  return (
    <>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_80px_rgba(249,115,22,0.6)]"
            >
              <span className="text-6xl">🏆</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white font-display font-bold text-4xl mb-4"
            >
              ¡Completado!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300 font-medium text-lg mb-10 max-w-sm"
            >
              Has finalizado el 100% de tu plan de hoy. ¡Una medalla fue añadida a tu perfil!
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseSuccess}
              className="w-full max-w-sm bg-gym-lime text-black font-display font-bold text-xl py-4 rounded-full shadow-[0_4px_20px_rgba(204,255,0,0.2)]"
            >
              Increíble
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for expanded state */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      <motion.div 
        layout
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className={`fixed z-[70] ${isExpanded ? 'bottom-8 left-4 right-4' : 'bottom-[100px] right-4'} ${showSuccessModal ? 'hidden' : ''}`}
      >
        <motion.div 
          layout
          className={`bg-gym-lime text-black rounded-3xl shadow-2xl overflow-hidden border border-gym-lime/50 ${isExpanded ? 'p-6' : 'p-0'}`}
        >
          {!isExpanded ? (
            <button 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-3 px-5 py-3 font-display font-medium"
            >
              <div className="relative">
                <Timer size={20} className="animate-pulse" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="font-mono text-lg">{formatTime(elapsed)}</span>
            </button>
          ) : (
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-display font-bold text-xl uppercase leading-none mb-1">Entrenamiento Activo</h3>
                  <p className="text-black/70 font-medium text-sm">{activeRoutine?.name || 'Rutina'}</p>
                </div>
                <div className="bg-black text-gym-lime px-4 py-2 rounded-2xl font-mono text-xl font-bold">
                  {formatTime(elapsed)}
                </div>
              </div>
              
              <div className="w-full mt-4">
                <AnimatePresence mode="wait">
                  {!isUnlocked ? (
                    <motion.div 
                      key="locked"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <SlideToUnlock 
                        onUnlock={() => setIsUnlocked(true)} 
                        text="Desliza para terminar" 
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="unlocked"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col gap-2"
                    >
                      <button 
                         onClick={handleStop}
                         className="w-full bg-red-500 text-white font-display font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 shadow-xl transition-colors"
                      >
                         Terminar Entrenamiento
                      </button>
                      <button 
                         onClick={() => setIsUnlocked(false)}
                         className="w-full text-black/60 font-medium py-2 rounded-full mt-2"
                      >
                         Cancelar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
