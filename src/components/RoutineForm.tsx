import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Save } from 'lucide-react';
import { Routine, Exercise, ExerciseType } from '../types';
import { useAppContext } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';

interface RoutineFormProps {
  routine: Routine | null;
  onClose: () => void;
}

const EXERCISE_TYPES: ExerciseType[] = ['Potencia', 'Movilidad', 'Zona Media', 'Fuerza', 'Estructura', 'Accesorio'];
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function RoutineForm({ routine, onClose }: RoutineFormProps) {
  const { addRoutine, updateRoutine } = useAppContext();
  
  const [name, setName] = useState(routine?.name || '');
  const [assignedDay, setAssignedDay] = useState(routine?.assignedDay ?? 0);
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);

  const getTypeColorClass = (type: ExerciseType) => {
    switch (type) {
      case 'Movilidad': return 'text-[#A482FF]';
      case 'Zona Media': return 'text-[#38BDF8]';
      case 'Fuerza': return 'text-gym-lime';
      case 'Potencia': return 'text-[#EF4444]';
      case 'Estructura': return 'text-[#EC4899]';
      case 'Accesorio': return 'text-[#F97316]';
      default: return 'text-gray-400';
    }
  };

  const handleAddExercise = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setExercises([...exercises, { id: uuidv4(), name: '', type: 'Fuerza', weight: 0, reps: 0, sets: 0 }]);
  };

  const handleUpdateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const handleRemoveExercise = (id: string) => {
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate([100]);
    if (!name.trim()) return alert('El nombre de la rutina es obligatorio.');
    
    if (routine) {
      updateRoutine(routine.id, { name, assignedDay, exercises });
    } else {
      addRoutine({ name, assignedDay, exercises });
    }
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 w-full bg-gym-dark flex flex-col z-50 overflow-hidden"
    >
      <header className="shrink-0 flex items-center justify-between p-6 pt-10 pb-4 bg-gym-dark border-b border-white/5 z-30">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 text-white transition">
           <ChevronLeft size={24} />
        </button>
        <span className="text-white font-display font-medium text-lg">
          {routine ? 'Editar Rutina' : 'Nueva Rutina'}
        </span>
        <button onClick={handleSave} className="p-2 -mr-2 text-gym-lime hover:text-white transition">
           <Save size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="p-6 pb-32 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Nombre</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gym-card text-white px-4 py-3 rounded-2xl border border-neutral-800 focus:border-gym-lime focus:outline-none transition font-medium"
                placeholder="Ej. Full Body, Brazo..."
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Día asignado</label>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {DAYS.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAssignedDay(idx)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                      ${assignedDay === idx ? 'bg-[#A482FF] text-[#20104A]' : 'bg-gym-card text-gray-400 border border-neutral-800'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4 sticky -top-6 z-20 bg-gym-dark py-4 -mx-6 px-6 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] border-b border-white/5">
              <h3 className="text-white font-display font-bold text-lg">Ejercicios</h3>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleAddExercise}
                className="flex items-center gap-1 text-xs font-bold text-gym-lime uppercase px-3 py-1.5 bg-gym-lime/10 rounded-full"
              >
                <Plus size={14} /> Añadir
              </motion.button>
            </div>

          <div className="space-y-4">
            <AnimatePresence>
              {exercises.map((ex, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                  key={ex.id} className="bg-gym-card p-4 rounded-3xl border border-neutral-800 overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-1 relative">
                       <span className="w-6 h-6 flex items-center justify-center bg-neutral-800 rounded-full text-xs text-gray-400 font-display font-bold">
                         {index + 1}
                       </span>
                       <input 
                          type="text"
                          value={ex.name}
                          onChange={(e) => handleUpdateExercise(ex.id, { name: e.target.value })}
                          placeholder="Nombre del Ejercicio"
                          className="bg-transparent text-white font-bold font-display text-lg focus:outline-none w-full"
                       />
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 ml-2"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                  
                  {/* Type Selection */}
                  <div className="mb-4 flex gap-2">
                    <select 
                      value={ex.type}
                      onChange={(e) => handleUpdateExercise(ex.id, { type: e.target.value as ExerciseType })}
                      className={`bg-neutral-800 text-xs font-bold uppercase rounded-xl px-3 py-1.5 focus:outline-none appearance-none ${getTypeColorClass(ex.type)}`}
                    >
                      {EXERCISE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    
                    <select 
                      value={ex.trackingType || 'reps'}
                      onChange={(e) => handleUpdateExercise(ex.id, { trackingType: e.target.value as 'reps' | 'time' })}
                      className="bg-neutral-800 text-gray-300 text-xs font-bold uppercase rounded-xl px-3 py-1.5 focus:outline-none appearance-none"
                    >
                      <option value="reps">Reps</option>
                      <option value="time">Tiempo</option>
                    </select>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-neutral-900/50 p-2 rounded-2xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500 mb-1">Peso (kg)</span>
                      <input 
                        type="number"
                        value={ex.weight || ''}
                        onChange={(e) => handleUpdateExercise(ex.id, { weight: Number(e.target.value) })}
                        className="w-full bg-transparent text-center text-white font-display font-bold text-lg focus:outline-none hide-arrows"
                        placeholder="0"
                      />
                    </div>
                    <div className="bg-neutral-900/50 p-2 rounded-2xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500 mb-1">{(ex.trackingType === 'time') ? 'Segundos' : 'Reps'}</span>
                      <input 
                        type="number"
                        value={ex.reps || ''}
                        onChange={(e) => handleUpdateExercise(ex.id, { reps: Number(e.target.value) })}
                        className="w-full bg-transparent text-center text-white font-display font-bold text-lg focus:outline-none hide-arrows"
                        placeholder="0"
                      />
                    </div>
                    <div className="bg-neutral-900/50 p-2 rounded-2xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500 mb-1">Series</span>
                      <input 
                        type="number"
                        value={ex.sets || ''}
                        onChange={(e) => handleUpdateExercise(ex.id, { sets: Number(e.target.value) })}
                        className="w-full bg-transparent text-center text-white font-display font-bold text-lg focus:outline-none hide-arrows"
                        placeholder="0"
                      />
                    </div>
                    <div className="bg-neutral-900/50 p-2 rounded-2xl text-center">
                      <span className="block text-[10px] uppercase text-gray-500 mb-1">RIR (Opc.)</span>
                      <input 
                        type="number"
                        value={ex.rir || ''}
                        onChange={(e) => handleUpdateExercise(ex.id, { rir: Number(e.target.value) })}
                        className="w-full bg-transparent text-center text-white font-display font-bold text-lg focus:outline-none hide-arrows"
                        placeholder="—"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {exercises.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">
                No hay ejercicios. Añade uno para empezar.
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
