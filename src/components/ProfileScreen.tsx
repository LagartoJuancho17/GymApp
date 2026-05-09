import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { Medal, Flame, Trophy, LogOut, Target, Edit2, Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Goal } from '../types';

export function ProfileScreen() {
  const { user, completedWorkouts, signOut, goals, setGoals, deleteCompletedWorkout } = useAppContext();
  
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goalsList, setGoalsList] = useState<Omit<Goal, 'id'>[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<'Semanal' | 'Mensual'>('Semanal');

  const openGoalsEditor = () => {
    setGoalsList(goals.map(g => ({ text: g.text, timeframe: g.timeframe })));
    setIsEditingGoals(true);
  };

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    setGoalsList([...goalsList, { text: newGoalText, timeframe: newGoalTimeframe }]);
    setNewGoalText('');
  };

  const handleRemoveGoal = (index: number) => {
    setGoalsList(goalsList.filter((_, i) => i !== index));
  };

  const handleSaveGoals = () => {
    const finalGoals: Goal[] = goalsList.map(g => ({ ...g, id: uuidv4() }));
    setGoals(finalGoals);
    setIsEditingGoals(false);
  };

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-12 h-12 rounded-full border-2 border-gym-lime" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-gray-400 font-medium text-xs truncate max-w-[150px]">{user?.email}</p>
            <h1 className="text-white font-display font-bold text-2xl">{user?.user_metadata?.full_name || 'Tu Perfil'}</h1>
          </div>
        </div>
        <button 
          onClick={signOut}
          className="w-10 h-10 flex items-center justify-center bg-[#1C1C24] text-red-400 rounded-full border border-red-500/20 active:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>



      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1C1C24] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gym-lime rounded-full opacity-10 blur-2xl"></div>
          <Flame size={32} className="text-gym-lime mb-3" />
          <h3 className="font-display font-bold text-3xl text-white mb-1">{completedWorkouts?.length || 0}</h3>
          <p className="text-xs text-gray-500 font-medium text-center">Entrenamientos Completados</p>
        </div>
        <div className="bg-[#1C1C24] p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFB800] rounded-full opacity-10 blur-2xl"></div>
          <Trophy size={32} className="text-[#FFB800] mb-3" />
          <h3 className="font-display font-bold text-3xl text-white mb-1">
            {completedWorkouts?.length > 10 ? 'Oro' : completedWorkouts?.length > 5 ? 'Plata' : 'Bronce'}
          </h3>
          <p className="text-xs text-gray-500 font-medium text-center">Nivel Actual</p>
        </div>
      </div>

      <h2 className="text-white font-display font-bold text-xl mb-4 mt-8">Muro de Medallas</h2>
      
      <div className="space-y-4 mb-8">
        {completedWorkouts?.map((workout, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={workout.id} 
            className="bg-[#1C1C24] p-4 rounded-2xl border border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                <Medal size={24} className="text-[#FFB800]" />
              </div>
              <div>
                <h3 className="text-white font-bold">{workout.routineName}</h3>
                <p className="text-xs text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
              </div>
            </div>
            <button 
              onClick={() => deleteCompletedWorkout(workout.id)}
              className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-full transition-colors"
              title="Eliminar logro"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}

        {!completedWorkouts?.length && (
          <div className="text-center py-10">
            <Medal size={48} className="text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 text-sm font-medium">Aún no tienes medallas.<br/>¡Completa tu primer entrenamiento!</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-display font-bold text-xl">Tus Metas</h2>
        <button onClick={openGoalsEditor} className="text-gym-lime flex items-center gap-1 text-sm font-bold bg-gym-lime/10 px-3 py-1.5 rounded-full hover:bg-gym-lime/20 transition">
          <Edit2 size={14} /> Editar
        </button>
      </div>

      <div className="space-y-3 pb-8">
        {goals.map((goal, idx) => (
          <div key={idx} className="bg-[#1C1C24] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gym-lime/10 flex items-center justify-center">
                <Target size={20} className="text-gym-lime" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{goal.text}</p>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mt-1 inline-block
                  ${goal.timeframe === 'Semanal' ? 'text-gym-lime border-gym-lime/30 bg-gym-lime/5' : 'text-gym-purple border-gym-purple/30 bg-gym-purple/5'}`}>
                  {goal.timeframe}
                </span>
              </div>
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4 bg-[#1C1C24] rounded-2xl border border-white/5">No tienes metas configuradas.</p>
        )}
      </div>

      <AnimatePresence>
        {isEditingGoals && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gym-dark w-full max-w-md h-[80vh] rounded-[32px] border border-neutral-800 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <h2 className="text-white font-display font-bold text-xl">Editar Metas</h2>
                <button onClick={() => setIsEditingGoals(false)} className="text-gray-400 hover:text-white transition">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
                {goalsList.map((goal, idx) => (
                  <div key={idx} className="bg-gym-card rounded-[20px] p-4 flex items-center justify-between border border-neutral-800">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-white font-bold text-sm truncate">{goal.text}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border mt-1 inline-block
                        ${goal.timeframe === 'Semanal' ? 'text-gym-lime border-gym-lime/30 bg-gym-lime/5' : 'text-gym-purple border-gym-purple/30 bg-gym-purple/5'}`}>
                        {goal.timeframe}
                      </span>
                    </div>
                    <button onClick={() => handleRemoveGoal(idx)} className="text-red-400 p-2 hover:bg-neutral-800 rounded-full transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {goalsList.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-10">No has agregado ninguna meta.</p>
                )}
              </div>

              <div className="p-6 bg-[#1C1C24] border-t border-white/5">
                <div className="bg-neutral-900 rounded-[20px] p-4 border border-neutral-800 flex flex-col gap-3 mb-4">
                  <input 
                    type="text" 
                    placeholder="Escribir nueva meta..." 
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                    className="bg-transparent text-white focus:outline-none w-full text-sm font-medium"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setNewGoalTimeframe('Semanal')}
                        className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full transition ${newGoalTimeframe === 'Semanal' ? 'bg-gym-lime text-black' : 'text-gray-500 bg-neutral-800'}`}
                      >
                        Semanal
                      </button>
                      <button 
                        onClick={() => setNewGoalTimeframe('Mensual')}
                        className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full transition ${newGoalTimeframe === 'Mensual' ? 'bg-gym-purple text-[#20104A]' : 'text-gray-500 bg-neutral-800'}`}
                      >
                        Mensual
                      </button>
                    </div>
                    <button onClick={handleAddGoal} className="text-gym-lime p-1 hover:bg-neutral-800 rounded-full transition">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleSaveGoals}
                  className="w-full bg-gym-lime text-black font-display font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  Guardar Metas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
