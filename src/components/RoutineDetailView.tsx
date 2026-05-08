import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, Dumbbell, Check, Timer } from 'lucide-react';
import { Routine, Exercise, ExerciseType } from '../types';
import { useAppContext } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { SlideToUnlock } from './SlideToUnlock';
import { SecondaryTimer } from './SecondaryTimer';
import { formatTime, getEmbedUrl } from '../lib/utils';
import { playSilentAudio, stopSilentAudio } from '../lib/audio';

interface RoutineDetailViewProps {
  routine: Routine;
  onClose: () => void;
}

const getTypeColorClass = (type: ExerciseType) => {
  switch (type) {
    case 'Movilidad': return 'text-[#A482FF] border-[#A482FF]/30 bg-[#A482FF]/10';
    case 'Zona Media': return 'text-[#38BDF8] border-[#38BDF8]/30 bg-[#38BDF8]/10';
    case 'Fuerza': return 'text-[#CCFF00] border-[#CCFF00]/30 bg-[#CCFF00]/10'; // gym-lime
    case 'Potencia': return 'text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10';
    case 'Estructura': return 'text-[#EC4899] border-[#EC4899]/30 bg-[#EC4899]/10';
    case 'Accesorio': return 'text-[#F97316] border-[#F97316]/30 bg-[#F97316]/10';
    default: return 'text-gray-400 border-neutral-700 bg-neutral-800/50';
  }
};

export function RoutineDetailView({ routine, onClose }: RoutineDetailViewProps) {
  const { 
    completedExercises, 
    toggleCompletedExercise, 
    addExerciseLog, 
    updateRoutine, 
    exerciseLogs,
    isTrainingGlobal: isTraining,
    trainingStartTimeGlobal: trainingStartTime,
    activeRoutineId,
    startTrainingGlobal,
    stopTrainingGlobal
  } = useAppContext();
  
  const [sessionData, setSessionData] = useState<Record<string, { weight: number, reps: number }>>({});

  // Timers State
  const [isUnlockedForStop, setIsUnlockedForStop] = useState(false);
  const [trainingElapsed, setTrainingElapsed] = useState(0);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isTraining && trainingStartTime) {
      interval = setInterval(() => {
        setTrainingElapsed(Date.now() - trainingStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTraining, trainingStartTime]);

  useEffect(() => {
    const initialData: Record<string, { weight: number, reps: number }> = {};
    routine.exercises.forEach(ex => {
      initialData[ex.id] = { weight: ex.weight, reps: ex.reps };
    });
    setSessionData(initialData);
  }, [routine]);

  const isThisRoutineActive = isTraining && activeRoutineId === routine.id;

  useEffect(() => {
    if (isThisRoutineActive) {
      const incompleteExercises = routine.exercises.filter(ex => !completedExercises.includes(ex.id));
      const currentExercise = incompleteExercises.length > 0 ? incompleteExercises[0] : null;

      if ('mediaSession' in navigator) {
        if (currentExercise) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `Actual: ${currentExercise.name}`,
            artist: `Rutina: ${routine.name}`,
            album: 'GymApp'
          });
        } else {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: '¡Entrenamiento Completado!',
            artist: routine.name,
            album: 'GymApp'
          });
        }
      }

      // Send a push notification if they background the app
      if (currentExercise && 'Notification' in window && Notification.permission === 'granted') {
        // We avoid spamming notifications, only send if it changed. 
        // We can track the last notified exercise to prevent spam if we want.
      }
    }
  }, [isThisRoutineActive, completedExercises, routine]);

  const handleUpdateSessionData = (id: string, field: 'weight' | 'reps', value: number) => {
    setSessionData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleToggleComplete = (ex: Exercise) => {
    const isNowCompleted = !completedExercises.includes(ex.id);
    toggleCompletedExercise(ex.id);

    if (isNowCompleted) {
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      const data = sessionData[ex.id] || { weight: ex.weight, reps: ex.reps };
      
      // Log the exercise to history
      addExerciseLog({
        date: new Date().toISOString(),
        exerciseName: ex.name,
        type: ex.type,
        trackingType: ex.trackingType,
        weight: data.weight,
        reps: data.reps,
        rir: ex.rir
      });

      // Update the routine template so next week it remembers the new weight
      const updatedExercises = routine.exercises.map(e => 
        e.id === ex.id ? { ...e, weight: data.weight, reps: data.reps, trackingType: ex.trackingType, rir: ex.rir } : e
      );
      updateRoutine(routine.id, { exercises: updatedExercises });
      toast.success(`¡${ex.name} completado!`);
    } else {
      if (navigator.vibrate) navigator.vibrate(50);
      toast.info(`Desmarcado: ${ex.name}`);
    }
  };

  const handleSaveExerciseStats = (exId: string, newWeight: number, newReps: number) => {
    const updatedExercises = routine.exercises.map(e => 
      e.id === exId ? { ...e, weight: newWeight, reps: newReps } : e
    );
    updateRoutine(routine.id, { exercises: updatedExercises });
    toast.success('Valores actualizados en la rutina');
  };

  const handleStartTraining = () => {
    startTrainingGlobal(routine.id);
    
    // Request notification permissions
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Start silent audio to keep media session alive on mobile
    playSilentAudio();
  };

  const handleStopTraining = () => {
    stopTrainingGlobal();
    setIsUnlockedForStop(false);
    setTrainingElapsed(0);
    stopSilentAudio();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 w-full relative overflow-y-auto hide-scrollbar bg-gym-dark flex flex-col h-full z-40"
    >
      <header className="flex items-center justify-between p-6 pt-10 pb-4 sticky top-0 bg-gym-dark/90 backdrop-blur z-10 transition-all">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 text-white transition">
           <ChevronLeft size={24} />
        </button>
        <span className="text-white font-display font-medium text-lg">
          Detalle
        </span>
        <div className="flex items-center gap-2">
          {isThisRoutineActive && (
            <div className="flex items-center space-x-2 mr-2">
              <span className="text-gym-lime font-mono font-medium animate-pulse">
                {formatTime(trainingElapsed)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Floating Secondary Timer */}
      <AnimatePresence>
        {isThisRoutineActive && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-28 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
          >
            <div className="pointer-events-auto w-full max-w-sm">
              <SecondaryTimer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 pb-24 flex-1 space-y-4">
         {/* General Info */}
         <div className="bg-[#A482FF]/10 rounded-[28px] p-6 border border-[#A482FF]/20 flex justify-between items-center mb-6">
            <div>
               <span className="text-[#A482FF] text-xs font-bold uppercase tracking-wider">Plan de Hoy</span>
               <h2 className="text-white font-display font-bold text-2xl mt-1">{routine.name}</h2>
               <p className="text-gray-400 text-sm mt-1">{routine.exercises.length} Ejercicios</p>
            </div>
            <div className="w-14 h-14 bg-[#A482FF] rounded-full flex items-center justify-center text-[#20104A] shrink-0">
               <Dumbbell size={28} />
            </div>
         </div>

         {/* Exercise List */}
         <div className="flex items-center justify-between mb-2">
             <h3 className="text-white font-display font-bold text-lg">Ejercicios a realizar</h3>
         </div>
         <div className="space-y-4">
           {routine.exercises.map((ex, idx) => {
             const isCompleted = completedExercises.includes(ex.id);
             const currentData = sessionData[ex.id] || { weight: ex.weight, reps: ex.reps };
             
             // Compute history
             const history = exerciseLogs
               .filter(log => log.exerciseName === ex.name)
               .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
               
             let diffElem = null;
             if (history.length > 0) {
               const firstLog = history[0];
               // Just to show their starting weight initially vs now
               const isHigher = currentData.weight > firstLog.weight;
               const diff = currentData.weight - firstLog.weight;
               
               if (!isCompleted) {
                 if (diff !== 0) {
                   diffElem = (
                     <div className="flex items-center gap-1 mt-1">
                       <span className={`text-[10px] font-bold ${isHigher ? 'text-gym-lime' : 'text-red-400'}`}>
                         {isHigher ? '+' : ''}{diff}kg
                       </span>
                       <span className="text-[10px] text-gray-500">desde inicio ({firstLog.weight}kg)</span>
                     </div>
                   );
                 } else {
                   diffElem = (
                     <div className="flex items-center gap-1 mt-1">
                       <span className="text-[10px] text-gray-500">Inicial: {firstLog.weight}kg</span>
                     </div>
                   );
                 }
               }
             }
             return (
             <motion.div 
               layout
               whileTap={{ scale: expandedVideoId === ex.id ? 1 : 0.98 }}
               key={ex.id} 
               onClick={() => handleToggleComplete(ex)}
               className={`rounded-[24px] p-4 border shadow-lg flex flex-col gap-4 cursor-pointer transition-all ${isCompleted ? 'bg-[#A482FF]/10 border-[#A482FF]/30' : 'bg-gym-card hover:bg-neutral-800 border-neutral-800'}`}
             >
               <div className="flex items-center gap-4 w-full">
                 <motion.div layout className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 transition-colors ${isCompleted ? 'bg-[#A482FF] text-[#20104A] border-none' : 'bg-neutral-800 text-gym-lime'}`}>
                    {isCompleted ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18} strokeWidth={3} /></motion.div> : idx + 1}
                 </motion.div>
                 <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-base mb-1 truncate transition-colors ${isCompleted ? 'line-through text-[#A482FF]' : 'text-white'}`}>{ex.name}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] border px-2 py-0.5 rounded-md uppercase font-bold transition-colors ${getTypeColorClass(ex.type)}`}>{ex.type}</span>
                      {ex.rir !== undefined && ex.rir !== 0 && (
                        <span className="text-[10px] bg-neutral-800 text-gray-300 px-2 py-0.5 rounded-md uppercase font-bold">RIR: {ex.rir}</span>
                      )}
                      {diffElem}
                    </div>
                    {ex.videoUrl && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedVideoId(expandedVideoId === ex.id ? null : ex.id); }}
                        className="mt-2 text-xs text-white flex items-center gap-1 font-medium bg-white/10 px-2 py-1 rounded-md w-max"
                      >
                        <Play size={10} fill="currentColor" /> {expandedVideoId === ex.id ? 'Ocultar Video' : 'Ver Video'}
                      </button>
                    )}
                 </div>
                 <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <AnimatePresence mode="wait">
                      {isCompleted ? (
                        <motion.div key="completed" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                          <span className={`block font-display font-bold text-lg transition-colors text-[#A482FF]/70`}>{currentData.weight} <span className="text-xs text-gray-400 font-sans">kg</span></span>
                          <span className={`block font-display font-medium text-sm transition-colors text-[#A482FF]/70`}>
                            {ex.sets}x{currentData.reps}{ex.trackingType === 'time' ? 's' : ''}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div key="incomplete" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-end">
                          <div className="flex items-center gap-1 justify-end mb-1">
                            <input 
                              type="number" 
                              value={currentData.weight === undefined ? '' : currentData.weight}
                              onChange={(e) => handleUpdateSessionData(ex.id, 'weight', Number(e.target.value))}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-neutral-900 border border-neutral-700 rounded-lg w-14 text-center font-display font-bold text-white py-1 hide-arrows focus:outline-none focus:border-gym-lime"
                            />
                            <span className="text-xs text-gray-400 font-sans">kg</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-[#A482FF] font-display font-medium text-sm">{ex.sets}x</span>
                            <input 
                              type="number" 
                              value={currentData.reps === undefined ? '' : currentData.reps}
                              onChange={(e) => handleUpdateSessionData(ex.id, 'reps', Number(e.target.value))}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-neutral-900 border border-neutral-700 rounded-lg w-12 text-center font-display font-bold text-[#A482FF] py-1 hide-arrows focus:outline-none focus:border-[#A482FF]"
                            />
                            {ex.trackingType === 'time' && <span className="text-xs text-[#A482FF] font-sans">s</span>}
                          </div>
                          {(currentData.weight !== ex.weight || currentData.reps !== ex.reps) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveExerciseStats(ex.id, currentData.weight, currentData.reps);
                              }}
                              className="mt-2 text-[9px] uppercase font-bold text-black bg-gym-lime px-2 py-1 rounded"
                            >
                              Guardar
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               </div>

               <AnimatePresence>
                 {expandedVideoId === ex.id && ex.videoUrl && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="w-full rounded-xl overflow-hidden mt-2"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <iframe
                       width="100%"
                       height="250"
                       src={getEmbedUrl(ex.videoUrl) || ''}
                       title="YouTube video player"
                       frameBorder="0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                       className="bg-black/50"
                     ></iframe>
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
             );
           })}
           
           {routine.exercises.length === 0 && (
             <p className="text-center text-sm text-gray-500 py-4">
               No hay ejercicios en esta rutina.
             </p>
           )}
         </div>

         {/* Start/Stop Button Area */}
         {routine.exercises.length > 0 && (
            <div className="mt-8 mb-4">
              {isThisRoutineActive ? (
                <div className="w-full">
                  <AnimatePresence mode="wait">
                    {!isUnlockedForStop ? (
                      <motion.div 
                        key="locked"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <SlideToUnlock 
                          onUnlock={() => setIsUnlockedForStop(true)} 
                          text="Desliza para terminar" 
                        />
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="unlocked"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <button 
                           onClick={handleStopTraining}
                           className="w-full bg-red-500 text-white font-display font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-colors"
                        >
                           Terminar Entrenamiento
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : isTraining ? (
                 <div className="w-full bg-neutral-800 text-center text-gray-400 font-medium py-4 rounded-full">
                    Ya tienes otro entrenamiento activo
                 </div>
              ) : (
                <motion.button 
                   onClick={handleStartTraining}
                   whileTap={{ scale: 0.95 }}
                   className="w-full bg-gym-lime text-black font-display font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(204,255,0,0.15)] transition-colors"
                >
                   <Play size={20} fill="currentColor" /> Empezar a Entrenar
                </motion.button>
              )}
            </div>
         )}
      </div>
    </motion.div>
  );
}
