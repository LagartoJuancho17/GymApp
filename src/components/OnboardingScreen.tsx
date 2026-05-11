import React, { useState } from 'react';
import { Goal } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store';
import { Play, Plus, Trash2, Target, Flame, Minus } from 'lucide-react';

export function OnboardingScreen() {
  const { setGoals, completeOnboarding } = useAppContext();
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [goalsList, setGoalsList] = useState<Omit<Goal, 'id'>[]>([
    { text: 'Llegar a los 100kg en press plano', timeframe: 'Mensual' }
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<'Semanal' | 'Mensual'>('Mensual');

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    setGoalsList([...goalsList, { text: newGoalText, timeframe: newGoalTimeframe }]);
    setNewGoalText('');
  };

  const handleRemoveGoal = (index: number) => {
    setGoalsList(goalsList.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    // La meta semanal se guarda como un Goal especial con weeklyTrainingGoal
    const weeklyTrainingGoalObj: Goal = {
      id: uuidv4(),
      text: `Entrenar ${weeklyGoal} ${weeklyGoal === 1 ? 'día' : 'días'} a la semana`,
      timeframe: 'Semanal',
      weeklyTrainingGoal: weeklyGoal,
    };
    const otherGoals: Goal[] = goalsList.map(g => ({ ...g, id: uuidv4() }));
    setGoals([weeklyTrainingGoalObj, ...otherGoals]);
    completeOnboarding();
  };

  return (
    <div className="flex-1 w-full relative overflow-y-auto hide-scrollbar bg-gym-dark flex flex-col items-center justify-center p-6 h-full z-50">
      <div className="w-20 h-20 bg-gym-lime/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(204,255,0,0.2)]">
        <Target size={40} className="text-gym-lime" />
      </div>
      
      <h1 className="text-white font-display font-bold text-3xl mb-2 text-center">Tus Metas</h1>
      <p className="text-gray-400 text-center mb-8 text-sm max-w-[80%]">Define tus objetivos para mantenerte enfocado.</p>

      {/* Selector de entrenamientos semanales */}
      <div className="w-full bg-[#1C1C24] rounded-[24px] p-5 border border-neutral-700 mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={18} className="text-orange-400" />
          <span className="text-white font-bold text-sm">Entrenamientos por semana</span>
        </div>
        <p className="text-gray-500 text-xs mb-4">Define cuántos días vas al gym por semana. Esto calcula tu racha 🔥</p>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeeklyGoal(Math.max(1, weeklyGoal - 1))}
            className="w-11 h-11 bg-neutral-800 rounded-full flex items-center justify-center text-white hover:bg-neutral-700 active:scale-90 transition-all"
          >
            <Minus size={18} />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all ${
                    i < weeklyGoal ? 'bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-neutral-800 text-gray-600'
                  }`}
                >
                  🔥
                </div>
              ))}
            </div>
            <span className="text-white font-display font-bold text-2xl">{weeklyGoal} <span className="text-gray-400 text-base font-normal">{weeklyGoal === 1 ? 'día' : 'días'}</span></span>
          </div>
          <button
            onClick={() => setWeeklyGoal(Math.min(7, weeklyGoal + 1))}
            className="w-11 h-11 bg-neutral-800 rounded-full flex items-center justify-center text-white hover:bg-neutral-700 active:scale-90 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      
      <div className="w-full space-y-4 mb-8">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Otras metas</p>
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
            placeholder="Escribir otra meta..." 
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
