import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Grid2X2, 
  Footprints, 
  Home, 
  BarChart2, 
  Dumbbell, 
  User,
  Target,
  DatabaseZap,
  Activity,
  CalendarDays,
  X
} from 'lucide-react';
import { useAppContext } from '../store';
import { RoutineDetailView } from './RoutineDetailView';
import { Routine } from '../types';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const { routines, completedExercises, exerciseLogs, goals, completedWorkouts, updateRoutine } = useAppContext();
  const [viewingRoutine, setViewingRoutine] = useState<Routine | null>(null);
  const [activeTab, setActiveTab] = useState('Todo');
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Verificando conexión...');
  const [selectingRoutineForDay, setSelectingRoutineForDay] = useState(false);
  const [reprogrammingRoutine, setReprogrammingRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const db = supabase();
      if (!db) {
        setSupabaseStatus('No configurado en variables de entorno');
        return;
      }
      try {
        const { error } = await db.from('routines').select('id').limit(1);
        if (error) {
          setSupabaseStatus('Error leyendo routines: ' + error.message);
        } else {
          setSupabaseStatus('Conexión OK (Puede leer routines)');
        }
      } catch (err: any) {
        setSupabaseStatus('Excepción: ' + err.message);
      }
    };
    checkStatus();
  }, []);

  const debugInsert = async () => {
    const db = supabase();
    if (!db) { alert("Supabase no configurado"); return; }
    
    alert("Intentando insertar una rutina de prueba...");
    const testId = uuidv4();
    const payload = {
      id: testId,
      name: "Prueba Debug " + new Date().toLocaleTimeString(),
      assigned_day: 1,
      exercises: []
    };
    
    const { data, error } = await db.from('routines').insert([payload]).select('*');
    
    if (error) {
      alert("ERROR DE SUPABASE DETALLADO:\n" + JSON.stringify(error, null, 2));
    } else {
      alert("ÉXITO INSERTANDO EN SUPABASE:\n" + JSON.stringify(data, null, 2));
    }
  };

  const attendedDaysThisMonth = useMemo(() => {
    const days = new Set<number>();
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    exerciseLogs.forEach(log => {
      if (log.date.startsWith(currentMonthPrefix)) {
        const day = parseInt(log.date.split('-')[2].substring(0, 2), 10);
        days.add(day);
      }
    });
    return days;
  }, [exerciseLogs]);

  const completedWorkoutDaysThisMonth = useMemo(() => {
    const days = new Set<number>();
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    completedWorkouts.forEach(workout => {
      if (workout.date.startsWith(currentMonthPrefix)) {
        const day = parseInt(workout.date.split('-')[2].substring(0, 2), 10);
        days.add(day);
      }
    });
    return days;
  }, [completedWorkouts]);
  
  const weekDays = useMemo(() => {
    const anchorDate = new Date();
    anchorDate.setDate(selectedDate);
    
    const startDay = new Date(anchorDate);
    startDay.setDate(anchorDate.getDate() - 1);

    const days = [];
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDay);
      d.setDate(startDay.getDate() + i);
      const dateNum = d.getDate();
      const dayOfWeek = d.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      days.push({
        day: dayNames[dayOfWeek],
        date: dateNum,
        attended: attendedDaysThisMonth.has(dateNum),
        completed: completedWorkoutDaysThisMonth.has(dateNum),
        dayIndex: dayIndex,
        fullDate: d
      });
    }
    return days;
  }, [selectedDate, attendedDaysThisMonth, completedWorkoutDaysThisMonth]);

  const selectedDayInfo = weekDays.find(d => d.date === selectedDate);
  const selectedDayIndex = selectedDayInfo ? selectedDayInfo.dayIndex : (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const todaysRoutine = routines.find(r => r.assignedDay === selectedDayIndex);

  const fullCalendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startingDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < startingDayIndex; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  }, []);

  const currentMonthText = useMemo(() => {
    const date = new Date();
    const month = date.toLocaleString('es-ES', { month: 'long' });
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
  }, []);

  if (viewingRoutine) {
    return <RoutineDetailView routine={viewingRoutine} onClose={() => setViewingRoutine(null)} />;
  }

  return (
    <div className="flex-1 w-full relative overflow-y-auto hide-scrollbar bg-gym-dark">
      {/* Main Content Padding */}
      <div className="p-6 pb-6">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-6 pt-4">
          <h1 className="text-xl font-display font-medium text-white tracking-wide">Tu Actividad</h1>
          <button className="text-gray-400 hover:text-white transition">
            <Grid2X2 size={24} />
          </button>
        </header>

        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="flex items-center gap-2 text-lg text-gray-300 font-sans hover:text-white transition group"
          >
            {currentMonthText}
            <ChevronDown size={20} className={`transform transition-transform ${showFullCalendar ? 'rotate-180 text-gym-lime' : 'group-hover:text-white'}`} />
          </button>
          <div className="flex items-center bg-gym-card rounded-full p-1">
            <button className="p-1 rounded-full text-white hover:bg-neutral-700 transition">
              <ChevronLeft size={20} />
            </button>
            <button className="p-1 rounded-full font-bold text-white bg-white hover:bg-gray-200 transition">
              <ChevronRight size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* Calendar Toggle */}
        {showFullCalendar ? (
          <div className="bg-gym-card rounded-3xl p-5 mb-8 border border-neutral-800 shadow-lg">
            <div className="grid grid-cols-7 gap-y-4 mb-2 text-center">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <span key={i} className="text-xs text-gray-400 font-medium">{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {fullCalendarDays.map((date, idx) => {
                if (date === null) return <div key={`empty-${idx}`} />;
                const isActive = date === selectedDate;
                const isAttended = attendedDaysThisMonth.has(date);
                const isCompleted = completedWorkoutDaysThisMonth.has(date);
                return (
                  <div key={date} className="flex flex-col items-center gap-1 mt-1">
                    <button 
                      onClick={() => {
                        setSelectedDate(date);
                        setShowFullCalendar(false);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all relative
                      ${isActive 
                        ? 'bg-gym-lime text-black ring-2 ring-gym-lime/20' 
                        : 'text-gray-300 hover:bg-neutral-800 cursor-pointer'} 
                      ${isCompleted && !isActive ? 'text-orange-500' : isAttended && !isActive ? 'text-gym-purple' : ''}`}
                    >
                      {date}
                    </button>
                    <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.8)]' : isAttended ? 'bg-gym-purple shadow-[0_0_4px_rgba(185,131,255,0.8)]' : 'bg-transparent'}`}></div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-center items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gym-purple"></div>
                Completado
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                 <div className="w-2 h-2 rounded-full bg-gym-lime"></div>
                Seleccionado
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-8">
            {weekDays.map((item, index) => {
              const isActive = item.date === selectedDate;
              const isCompleted = item.completed;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">{item.day}</span>
                  <button 
                    onClick={() => setSelectedDate(item.date)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold transition-all relative
                    ${isActive 
                      ? 'bg-gym-lime text-black ring-4 ring-gym-lime/20' 
                      : 'text-gray-300 hover:bg-neutral-800 cursor-pointer'}
                    ${isCompleted && !isActive ? 'text-orange-500' : item.attended && !isActive ? 'text-gym-purple' : ''}`}
                  >
                    {item.date}
                  </button>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isCompleted ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : item.attended ? 'bg-gym-purple shadow-[0_0_8px_rgba(185,131,255,0.8)]' : 'bg-transparent'}`}></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Today's Challenge Card */}
        <div className="bg-gym-lime rounded-3xl p-6 mb-6 relative overflow-hidden group shadow-lg shadow-gym-lime/10">
          {/* Background decorative element */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
          
          <h2 className="text-black font-display font-bold text-lg leading-tight mb-1 relative z-10 w-[70%]">Desafío de hoy</h2>
          <p className="text-black/80 font-medium text-sm max-w-[65%] leading-snug relative z-10 mt-1">
            Mantén tu racha viva y completa tu rutina.
          </p>
          
          {/* Simulation of Character/Runner Element */}
          <div className="absolute top-[50%] -translate-y-1/2 right-4 w-[85px] h-[85px] bg-black/10 rounded-full flex items-center justify-center shadow-inner">
            <Footprints className="text-black/40 w-10 h-10 -rotate-12" />
          </div>
        </div>

        {/* Today's Routine Card */}
        {todaysRoutine ? (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-display font-medium text-lg">Tu plan de hoy</h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setReprogrammingRoutine(todaysRoutine);
                }}
                className="text-gray-400 hover:text-white text-xs bg-neutral-800 px-3 py-1.5 rounded-full flex items-center gap-1 transition"
              >
                 <CalendarDays size={14} /> Cambiar Día
              </button>
            </div>
            <div 
              onClick={() => setViewingRoutine(todaysRoutine)}
              className="bg-[#A482FF]/10 backdrop-blur-md rounded-[32px] p-6 border border-[#A482FF]/20 shadow-lg relative overflow-hidden cursor-pointer hover:bg-[#A482FF]/20 transition-colors"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gym-purple/20 rounded-full -mr-10 -mt-10 blur-xl"></div>
               <div className="flex items-start justify-between relative z-10 mb-4">
                 <div>
                   <h4 className="text-white font-display font-bold text-xl">{todaysRoutine.name}</h4>
                   <span className="bg-gym-purple text-[#20104A] text-xs font-bold uppercase mt-2 px-3 py-1 rounded-full inline-block">
                     {todaysRoutine.exercises.length} Ejercicios
                   </span>
                 </div>
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
                   <Dumbbell size={20} />
                 </div>
               </div>
               <div className="space-y-3 relative z-10">
                 {todaysRoutine.exercises.slice(0, 3).map((ex, i) => {
                   const isCompleted = completedExercises.includes(ex.id);
                   return (
                   <div key={ex.id} className={`flex justify-between items-center p-3.5 rounded-[20px] transition-colors ${isCompleted ? 'bg-[#A482FF]/20' : 'bg-black/40'}`}>
                     <span className={`font-medium text-sm transition-colors ${isCompleted ? 'line-through text-[#A482FF]' : 'text-white'}`}>{ex.name}</span>
                     <span className={`font-display text-sm font-bold tracking-tight transition-colors ${isCompleted ? 'text-[#A482FF]/70' : 'text-gym-lime'}`}>{ex.sets}x{ex.reps}</span>
                   </div>
                 )})}
                 {todaysRoutine.exercises.length > 3 && (
                   <p className="text-center text-xs text-gray-400 font-medium pt-1">+{todaysRoutine.exercises.length - 3} ejercicios más</p>
                 )}
               </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-white font-display font-medium text-lg mb-3">Tu plan de hoy</h3>
            <div className="bg-neutral-900/50 rounded-[32px] p-6 border border-neutral-800 text-center border-dashed">
               <p className="text-gray-400 text-sm mb-4">No tienes rutina asignada para este día.</p>
               {routines.length > 0 && (
                 <button 
                   onClick={() => setSelectingRoutineForDay(true)}
                   className="bg-neutral-800 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-neutral-700 transition inline-flex items-center gap-2"
                 >
                   <CalendarDays size={16} /> Agregar rutina
                 </button>
               )}
            </div>
          </div>
        )}

        {/* Filters / Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto hide-scrollbar pb-1">
          {['Todo', 'Running', 'Ciclismo'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab 
                  ? 'bg-white text-black' 
                  : 'bg-transparent text-gray-400 hover:bg-neutral-800 hover:text-white border border-neutral-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          
          {/* Stats card */}
          <div className="bg-[#A482FF] rounded-[28px] p-5 relative overflow-hidden flex flex-col justify-between aspect-square">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-sm"></div>
            
            <div className="relative z-10">
              <span className="text-[#20104A] font-bold font-display block mb-1 text-[15px]">Completados</span>
              <p className="text-[#20104A]/90 text-[11px] font-semibold leading-snug w-[80%] pr-4">
                Total de rutinas finalizadas con éxito.
              </p>
            </div>
            
            <div className="flex justify-end relative z-10 w-full mt-auto">
              <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">
                <span className="text-[#20104A] font-display font-bold text-xl tracking-tighter">{completedWorkouts.length}</span>
              </div>
            </div>
          </div>

          {/* Active Goals List */}
          <div className="bg-[#1C1A2E] rounded-[28px] p-5 border border-gym-purple/10 flex flex-col gap-2 overflow-y-auto hide-scrollbar aspect-square relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-medium text-[13px]">Activas</span>
              <Target size={16} className="text-gym-purple/80" />
            </div>
            {goals.slice(0, 3).map((goal, i) => (
              <div key={i} className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                <p className="text-white text-xs font-bold leading-tight truncate">{goal.text}</p>
                <span className="text-[9px] text-[#A482FF] uppercase font-bold tracking-wider">{goal.timeframe}</span>
              </div>
            ))}
            {goals.length === 0 && (
              <p className="text-[10px] text-gray-500 text-center mt-2">No hay metas activas</p>
            )}
            {goals.length > 3 && (
              <p className="text-[10px] text-center text-gray-400">+{goals.length - 3} más</p>
            )}
          </div>

        </div>
      </div>

      {/* Select Routine Modal */}
      <AnimatePresence>
        {selectingRoutineForDay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-display font-medium text-lg">Selecciona una rutina</h3>
                <button onClick={() => setSelectingRoutineForDay(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                {routines.map(routine => (
                  <button
                    key={routine.id}
                    onClick={() => {
                      updateRoutine(routine.id, { assignedDay: selectedDayIndex });
                      setSelectingRoutineForDay(false);
                    }}
                    className="w-full bg-neutral-800 hover:bg-neutral-700/80 rounded-[20px] p-4 text-left transition"
                  >
                    <h4 className="text-white font-display font-bold">{routine.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{routine.exercises.length} Ejercicios</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reprogram Routine Modal */}
      <AnimatePresence>
        {reprogrammingRoutine && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-display font-medium text-lg">Cambiar Día</h3>
                <button onClick={() => setReprogrammingRoutine(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-6">¿A qué día quieres mover "<span className="text-white">{reprogrammingRoutine.name}</span>"?</p>
              
              <div className="grid grid-cols-2 gap-3">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dayName, idx) => (
                  <button
                    key={dayName}
                    onClick={() => {
                      updateRoutine(reprogrammingRoutine.id, { assignedDay: idx });
                      if (selectedDayIndex !== idx) {
                        // Optionally update target to jump to that day immediately
                        // If we want to stay on the current day without the routine, we do nothing.
                      }
                      setReprogrammingRoutine(null);
                    }}
                    className={`w-full rounded-[16px] p-3 text-center transition font-medium text-sm
                      ${reprogrammingRoutine.assignedDay === idx 
                        ? 'bg-gym-lime text-black' 
                        : 'bg-neutral-800 text-white hover:bg-neutral-700/80'}`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}