import React, { useState } from 'react';
import { Plus, Dumbbell, Edit2, Trash2, DatabaseZap } from 'lucide-react';
import { useAppContext } from '../store';
import { RoutineForm } from './RoutineForm';
import { Routine } from '../types';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export function RoutinesScreen() {
  const { routines, deleteRoutine } = useAppContext();
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  // Group routines by day (for display purposes we can just map them)
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  if (isCreating || editingRoutine) {
    return (
      <RoutineForm 
        routine={editingRoutine} 
        onClose={() => {
          setIsCreating(false);
          setEditingRoutine(null);
        }} 
      />
    );
  }

  const confirmDelete = () => {
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    if (routineToDelete) {
      deleteRoutine(routineToDelete);
      setRoutineToDelete(null);
    }
  };

  return (
    <div className="flex-1 w-full relative overflow-y-auto hide-scrollbar p-6 pb-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <h1 className="text-xl font-display font-medium text-white tracking-wide">Tus Rutinas</h1>
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => setIsCreating(true)}
          className="bg-gym-lime text-black rounded-full p-2 hover:bg-white transition"
        >
          <Plus size={24} />
        </motion.button>
      </header>

      {/* Supabase Warning Banner */}
      {!supabase() && (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start">
          <DatabaseZap size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-400 font-bold text-sm">Supabase No Conectado</h4>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Las rutinas se están guardando localmente (se borrarán al cerrar la sesión). Añade las credenciales de Supabase en <strong>Ajustes de Entorno</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Routines List */}
      <div className="space-y-4">
        <AnimatePresence>
          {routines.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 bg-gym-card rounded-2xl border border-neutral-800">
              <Dumbbell className="mx-auto mb-3 text-neutral-600" size={40} />
              <p className="text-gray-400 font-medium">No tienes rutinas creadas.</p>
            </motion.div>
          ) : (
            routines.map((routine) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                key={routine.id} 
                onClick={() => setEditingRoutine(routine)}
                className="bg-gym-card rounded-[24px] p-5 border border-white/5 relative flex flex-col justify-between shadow-lg cursor-pointer hover:border-white/20 transition-colors"
                role="button"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[#A482FF] font-bold text-xs uppercase tracking-wider mb-1 block">
                      {days[routine.assignedDay]}
                    </span>
                    <h2 className="text-white font-display font-bold text-lg">{routine.name}</h2>
                  </div>
                  <div className="flex gap-2">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoutineToDelete(routine.id);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-neutral-800 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span className="text-gray-300 text-xs font-semibold">{routine.exercises.length} ejercicios</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {routineToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gym-card border border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-white font-display font-bold text-xl mb-2">¿Eliminar rutina?</h3>
              <p className="text-gray-400 text-sm mb-6">Esta acción no se puede deshacer. Todos los ejercicios asociados a esta rutina serán eliminados.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setRoutineToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-neutral-800 text-white hover:bg-neutral-700 transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
