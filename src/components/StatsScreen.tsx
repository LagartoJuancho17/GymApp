import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Target } from 'lucide-react';
import { useAppContext } from '../store';

const COLORS = ['#CCFF00', '#A482FF', '#FFFFFF', '#FF5733', '#33FF57'];

export function StatsScreen() {
  const { exerciseLogs, routines } = useAppContext();

  const { weightData, topExercises } = useMemo(() => {
    const groupedByDate: Record<string, any> = {};
    const exercisesFound = new Set<string>();

    const exerciseTypes: Record<string, string> = {};
    routines.forEach(r => {
      r.exercises.forEach(ex => {
        exerciseTypes[ex.name.trim().toLowerCase()] = ex.type;
      });
    });

    exerciseLogs.forEach(log => {
      const logName = (log.exerciseName || '').trim().toLowerCase();
      let type = log.type || exerciseTypes[logName] || '';
      
      // Si el tipo es desconocido, asumimos 'Fuerza' para que el usuario igual vea su progreso
      if (!type) type = 'Fuerza';

      if (type.trim().toLowerCase() !== 'fuerza') {
        return;
      }
      
      if (!log.weight || log.weight === 0) {
        return; // Only show exercises that actually have weight logged
      }

      const dateObj = new Date(log.date);
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      const displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      const realName = log.exerciseName;

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { rawDate: dateKey, date: displayDate };
      }
      
      if (!groupedByDate[dateKey][realName] || log.weight > groupedByDate[dateKey][realName]) {
        groupedByDate[dateKey][realName] = log.weight;
      }
      exercisesFound.add(realName);
    });

    const data = Object.values(groupedByDate).sort((a, b) => a.rawDate.localeCompare(b.rawDate));
    const topExercises = Array.from(exercisesFound).slice(0, 5); // Take up to 5 for the chart

    return { weightData: data, topExercises };
  }, [exerciseLogs, routines]);

  const volumeData = useMemo(() => {
    const monthlyVolume: Record<string, number> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Inicializar los últimos 6 meses para que el gráfico siempre se vea bien
    const today = new Date();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      monthlyVolume[mName] = 0;
      last6Months.push(mName);
    }

    exerciseLogs.forEach(log => {
      const d = new Date(log.date);
      const monthLabel = monthNames[d.getMonth()];
      if (monthlyVolume[monthLabel] !== undefined) {
        const reps = Number(log.reps) || 0;
        const weight = Number(log.weight) || 0;
        monthlyVolume[monthLabel] += (weight * reps);
      }
    });

    return last6Months.map(m => ({ month: m, volume: monthlyVolume[m] }));
  }, [exerciseLogs]);

  const { currentMonthVolume, currentMonthSessions } = useMemo(() => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    let vol = 0;
    exerciseLogs.forEach(log => {
      if (log.date.startsWith(currentMonthStr)) {
        vol += (Number(log.weight) || 0) * (Number(log.reps) || 0);
      }
    });

    // Sesiones del mes, usamos los logs por dia
    const daysWithLogs = new Set();
    exerciseLogs.forEach(log => {
      if (log.date.startsWith(currentMonthStr)) {
        daysWithLogs.add(log.date.split('T')[0]);
      }
    });

    return { 
      currentMonthVolume: vol >= 1000 ? (vol / 1000).toFixed(1) + 'k' : vol.toString(),
      currentMonthSessions: daysWithLogs.size
    };
  }, [exerciseLogs]);

  // If we don't have enough data, we could show dummy data or empty state.
  // For now, we will show what we have.

  return (
    <div className="flex-1 w-full relative overflow-y-auto hide-scrollbar p-6 pb-6 space-y-6">
      
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-xl font-display font-medium text-white tracking-wide">Tus Estadísticas</h1>
        <TrendingUp className="text-gym-lime" size={24} />
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#A482FF]/10 border border-[#A482FF]/20 rounded-3xl p-5">
          <Target size={20} className="text-[#A482FF] mb-2" />
          <span className="text-3xl font-display font-bold text-white block">{currentMonthVolume}</span>
          <span className="text-xs text-gray-400 font-medium">Volumen Mensual (kg)</span>
        </div>
        <div className="bg-gym-lime/10 border border-gym-lime/20 rounded-3xl p-5">
          <Activity size={20} className="text-gym-lime mb-2" />
          <span className="text-3xl font-display font-bold text-white block">{currentMonthSessions}</span>
          <span className="text-xs text-gray-400 font-medium">Sesiones (Mes)</span>
        </div>
      </div>

      {/* Line Chart: Progression per exercise */}
      <div className="bg-gym-card rounded-[32px] p-6 shadow-lg border border-neutral-800">
        <h2 className="text-white font-display font-bold text-lg mb-1">Evolución de Fuerza (Kg)</h2>
        <p className="text-xs text-gray-400 mb-6 font-medium">Progresión de peso en ejercicios de fuerza</p>
        
        {weightData.length > 0 ? (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1C24', borderRadius: '16px', border: 'none', color: '#fff' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                  />
                  {topExercises.map((exName, i) => (
                    <Line 
                      key={exName}
                      type="monotone" 
                      dataKey={exName} 
                      stroke={COLORS[i % COLORS.length]} 
                      strokeWidth={3} 
                      connectNulls={true}
                      dot={{ r: 4, strokeWidth: 2 }} 
                      activeDot={{ r: 6 }} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              {topExercises.map((exName, i) => (
                <div key={exName} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs text-gray-300">{exName}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-gray-500 font-medium">No hay progresiones de peso aún.</p>
          </div>
        )}
      </div>

      {/* Bar Chart: Volume */}
      <div className="bg-gym-card rounded-[32px] p-6 shadow-lg border border-neutral-800">
        <h2 className="text-white font-display font-bold text-lg mb-1">Volumen Total</h2>
        <p className="text-xs text-gray-400 mb-6 font-medium">Kg levantados por mes</p>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#333', radius: 4 }}
                contentStyle={{ backgroundColor: '#1C1C24', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="volume" fill="#A482FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
