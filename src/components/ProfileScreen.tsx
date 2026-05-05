import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';
import { Medal, Flame, Trophy } from 'lucide-react';

export function ProfileScreen() {
  const { completedWorkouts } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <p className="text-gray-400 font-medium text-sm">Tu Perfil</p>
          <h1 className="text-white font-display font-bold text-3xl">Logros</h1>
        </div>
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

      <h2 className="text-white font-display font-bold text-xl mb-4">Muro de Medallas</h2>
      
      <div className="space-y-4">
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
          </motion.div>
        ))}

        {!completedWorkouts?.length && (
          <div className="text-center py-10">
            <Medal size={48} className="text-gray-600 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 text-sm font-medium">Aún no tienes medallas.<br/>¡Completa tu primer entrenamiento!</p>
          </div>
        )}
      </div>
    </div>
  );
}
