import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Target } from 'lucide-react';
import { useAppContext } from '../store';

const COLORS = ['#CCFF00', '#A482FF', '#FFFFFF', '#FF5733', '#33FF57'];

export function StatsScreen() {
  const { exerciseLogs, routines } = useAppContext();

  const { exerciseCharts } = useMemo(() => {
    const exerciseLogsMap: Record<string, any[]> = {};
    const exerciseTypes: Record<string, string> = {};

    // 1. Pre-fill map with all Fuerza exercises from routines so they always show up as a card
    routines.forEach(r => {
      r.exercises.forEach(ex => {
        const nameLower = ex.name.trim().toLowerCase();
        exerciseTypes[nameLower] = ex.type;
        
        if (ex.type === 'Fuerza' && ex.name.trim()) {
          // Check if we already added it (case-insensitive)
          const existingKey = Object.keys(exerciseLogsMap).find(k => k.toLowerCase() === nameLower);
          if (!existingKey) {
            exerciseLogsMap[ex.name.trim()] = [];
          }
        }
      });
    });

    exerciseLogs.forEach(log => {
      const logName = (log.exerciseName || '').trim().toLowerCase();
      let type = log.type || exerciseTypes[logName] || '';
      
      if (!type) type = 'Fuerza';

      if (type.trim().toLowerCase() !== 'fuerza') {
        return;
      }
      
      if (!log.weight || log.weight === 0) {
        return; 
      }

      const dateObj = new Date(log.date);
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      const displayDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      let realName = log.exerciseName;
      const existingKey = Object.keys(exerciseLogsMap).find(k => k.toLowerCase() === logName);
      
      if (existingKey) {
        realName = existingKey; // Use the properly capitalized name from routines if it exists
      } else {
        exerciseLogsMap[realName] = [];
      }
      
      const existing = exerciseLogsMap[realName].find(d => d.rawDate === dateKey);
      if (existing) {
        if (log.weight > existing.weight) {
          existing.weight = log.weight;
        }
      } else {
        exerciseLogsMap[realName].push({ rawDate: dateKey, date: displayDate, weight: log.weight });
      }
    });

    const charts = Object.entries(exerciseLogsMap).map(([name, data]) => {
      return {
        name,
        data: data.sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      };
    });

    return { exerciseCharts: charts };
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

      {/* Line Chart Carousel: Progression per exercise */}
      <div className="bg-gym-card rounded-[32px] p-6 shadow-lg border border-neutral-800">
        <h2 className="text-white font-display font-bold text-lg mb-1">Evolución de Fuerza (Kg)</h2>
        <p className="text-xs text-gray-400 mb-6 font-medium">Desliza para ver la progresión de cada ejercicio</p>
        
        {exerciseCharts.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-6 px-6 pb-4 space-x-4">
            {exerciseCharts.map((chart, i) => (
              <div key={chart.name} className="snap-center shrink-0 w-[85%] md:w-[280px] bg-neutral-900/50 p-5 rounded-[24px] border border-white/5">
                <h3 className="text-white font-display font-bold text-sm mb-4 text-center">{chart.name}</h3>
                <div className="h-48 w-full">
                  {chart.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chart.data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1C1C24', borderRadius: '16px', border: 'none', color: '#fff' }}
                          itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value} kg`, chart.name]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          name={chart.name}
                          stroke={COLORS[i % COLORS.length]} 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 2, fill: '#1C1C24' }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-2">
                      <p className="text-sm text-gray-400 font-bold mb-1">Sin datos</p>
                      <p className="text-[10px] text-gray-500 font-medium">Registra este ejercicio para ver tu progresión.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
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
