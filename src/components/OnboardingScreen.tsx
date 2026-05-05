import React, { useState } from 'react';
import { Goal } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store';
import { Play, Plus, Trash2, Target } from 'lucide-react';

export function OnboardingScreen() {
  const { setGoals, completeOnboarding } = useAppContext();
  const [goalsList, setGoalsList] = useState<Omit<Goal, 'id'>[]>([
    { text: 'Entrenar 4 días a la semana', timeframe: 'Semanal' },
    { text: 'Llegar a los 100kg en press plano', timeframe: 'Mensual' }
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<'Semanal' | 'Mensual'>('Semanal');

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    setGoalsList([...goalsList, { text: newGoalText, timeframe: newGoalTimeframe }]);
    setNewGoalText('');
  };

  const handleRemoveGoal = (index: number) => {
    setGoalsList(goalsList.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    const finalGoals: Goal[] = goalsList.map(g => ({ ...g, id: uuidv4() }));
    setGoals(finalGoals);
    completeOnboarding();
  };

  return (
    <div className="flex-1 w-full relative overflow-y-auto hide-scrollbar bg-gym-dark flex flex-col items-center justify-center p-6 h-full z-50">
      <div className="w-20 h-20 bg-gym-lime/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(204,255,0,0.2)]">
        <Target size={40} className="text-gym-lime" />
      </div>
      
      <h1 className="text-white font-display font-bold text-3xl mb-2 text-center">Tus Metas</h1>
      <p className="text-gray-400 text-center mb-8 text-sm max-w-[80%]">Define tus objetivos para mantenerte enfocado. Pueden ser metas semanales o mensuales.</p>
      
      <div className="w-full space-y-4 mb-8">
        {goalsList.map((goal, idx) => (
          <div key={idx} className="bg-gym-card rounded-[20px] p-4 flex items-center justify-between border border-neutral-800 shadow-md">
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

        <div className="bg-neutral-900 rounded-[20px] p-4 border border-neutral-800 flex flex-col gap-3">
          <input 
            type="text" 
            placeholder="Escribir meta..." 
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
      </div>

      <button 
        onClick={handleFinish}
        className="mt-auto w-full bg-white text-black font-display font-bold text-lg py-4 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
      >
        <Play size={20} fill="currentColor" /> Comenzar
      </button>
    </div>
  );
}
