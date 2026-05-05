import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Routine, INITIAL_ROUTINES, Goal, ExerciseLog, INITIAL_LOGS, CompletedWorkout } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';

interface AppState {
  routines: Routine[];
  completedExercises: string[];
  goals: Goal[];
  hasCompletedOnboarding: boolean;
  exerciseLogs: ExerciseLog[];
  isTrainingGlobal: boolean;
  trainingStartTimeGlobal: number | null;
  activeRoutineId: string | null;
  startTrainingGlobal: (routineId: string) => void;
  stopTrainingGlobal: () => void;
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
    toggleCompletedExercise: (id: string) => void;
  setGoals: (goals: Goal[]) => void;
  completeOnboarding: () => void;
  addExerciseLog: (log: Omit<ExerciseLog, 'id'>) => void;
  completedWorkouts: CompletedWorkout[];
  addCompletedWorkout: (workout: Omit<CompletedWorkout, 'id'>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(INITIAL_LOGS);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);

  const [isTrainingGlobal, setIsTrainingGlobal] = useState(false);
  const [trainingStartTimeGlobal, setTrainingStartTimeGlobal] = useState<number | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  const startTrainingGlobal = (routineId: string) => {
    setIsTrainingGlobal(true);
    setTrainingStartTimeGlobal(Date.now());
    setActiveRoutineId(routineId);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const stopTrainingGlobal = () => {
    setIsTrainingGlobal(false);
    setTrainingStartTimeGlobal(null);
    setActiveRoutineId(null);
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  };

  useEffect(() => {
    const fetchSupabaseData = async () => {
      const db = supabase();
      if (!db) return; // Utiliza mock data si no hay credenciales

      try {
        // Fetch Rutinas
        const { data: dbRoutines, error: routinesError } = await db.from('routines').select('*');
        if (routinesError) {
          console.error("Supabase Error fetch rutinas:", routinesError);
        } else if (dbRoutines) {
          // Si la base está totalmente vacía pero tenemos rutinas por defecto locales,
          // opcionalmente podrías insertarlas en supabase. Por ahora, las reemplazamos (empezará vacío)
          if (dbRoutines.length > 0) {
            setRoutines(dbRoutines.map((r: any) => ({
              id: r.id,
              name: r.name,
              assignedDay: r.assigned_day !== undefined ? r.assigned_day : r.assignedDay,
              exercises: r.exercises
            })));
          }
        }

        // Fetch logs
        const { data: dbLogs, error: logsError } = await db.from('exercise_logs').select('*');
        if (logsError) console.error("Supabase Error fetch logs:", logsError);
        else if (dbLogs && dbLogs.length > 0) {
          setExerciseLogs(dbLogs.map((l: any) => ({
            id: l.id,
            date: l.date,
            weight: l.weight,
            reps: l.reps,
            type: l.type,
            exerciseName: l.exercise_name !== undefined ? l.exercise_name : l.exerciseName
          })));
        }

        // Fetch goals
        const { data: dbGoals, error: goalsError } = await db.from('goals').select('*');
        if (goalsError) console.error("Supabase Error fetch goals:", goalsError);
        else if (dbGoals && dbGoals.length > 0) {
          setGoalsState(dbGoals);
          setHasCompletedOnboarding(true); // Si ya hay metas, saltamos onboarding
        }

        // Fetch completed workouts
        const { data: dbWorkouts, error: workoutsError } = await db.from('completed_workouts').select('*');
        if (workoutsError) console.error("Supabase Error fetch completed_workouts:", workoutsError);
        else if (dbWorkouts && dbWorkouts.length > 0) {
          setCompletedWorkouts(dbWorkouts.map((w: any) => ({
            id: w.id,
            routineId: w.routine_id,
            routineName: w.routine_name,
            date: w.date
          })));
        }

      } catch (err) {
        console.error("Error al cargar data de Supabase:", err);
      }
    };
    fetchSupabaseData();
  }, []);

  const addRoutine = async (routine: Omit<Routine, 'id'>) => {
    const newRoutine = { ...routine, id: uuidv4() };
    setRoutines(prev => [...prev, newRoutine]);

    const db = supabase();
    if (db) {
      const payload = {
        id: newRoutine.id,
        name: newRoutine.name,
        assigned_day: newRoutine.assignedDay,
        exercises: newRoutine.exercises
      };
      const { data, error } = await db.from('routines').insert([payload]).select();
      if (error) {
        console.error("Supabase Error Insertando Rutina:", error);
        toast.error(`Error guardando rutina: ${error.message}`);
      } else {
        toast.success("Rutina creada correctamente");
      }
    } else {
      toast.success("Rutina creada localmente");
    }
  };

  const updateRoutine = async (id: string, updatedFields: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));

    const db = supabase();
    if (db) {
      const payload: any = { ...updatedFields };
      if (payload.assignedDay !== undefined) {
        payload.assigned_day = payload.assignedDay;
        delete payload.assignedDay;
      }
      const { error } = await db.from('routines').update(payload).eq('id', id);
      if (error) {
        console.error("Supabase Error Actualizando Rutina:", error);
        toast.error(`Error actualizando rutina: ${error.message}`);
      } else {
        toast.success("Rutina actualizada");
      }
    } else {
      toast.success("Rutina actualizada localmente");
    }
  };

  const deleteRoutine = async (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));

    const db = supabase();
    if (db) {
      const { error } = await db.from('routines').delete().eq('id', id);
      if (error) {
        console.error("Supabase Error Eliminando Rutina:", error);
        toast.error(`Error eliminando rutina: ${error.message}`);
      } else {
        toast.success("Eliminado correctamente");
      }
    } else {
      toast.success("Eliminado correctamente localmente");
    }
  };

  const toggleCompletedExercise = (id: string) => {
    setCompletedExercises(prev => 
      prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
    );
  };

  const setGoals = async (newGoals: Goal[]) => {
    setGoalsState(newGoals);
    const db = supabase();
    if (db) {
      const { error } = await db.from('goals').upsert(newGoals);
      if (error) console.error("Supabase Error guardando Metas:", error);
    }
  };
  
  const completeOnboarding = () => setHasCompletedOnboarding(true);

  const addExerciseLog = async (log: Omit<ExerciseLog, 'id'>) => {
    const newLog = { ...log, id: uuidv4() };
    setExerciseLogs(prev => [...prev, newLog]);
    
    const db = supabase();
    if (db) {
      const payload = {
        id: newLog.id,
        date: newLog.date,
        weight: newLog.weight,
        reps: newLog.reps,
        exercise_name: newLog.exerciseName
      };
      const { error } = await db.from('exercise_logs').insert([payload]);
      if (error) console.error("Supabase Error guardando log:", error);
    }
  };

  const addCompletedWorkout = async (workout: Omit<CompletedWorkout, 'id'>) => {
    const newWorkout = { ...workout, id: uuidv4() };
    setCompletedWorkouts(prev => [...prev, newWorkout]);
    
    // Reset completed exercises for next time
    setCompletedExercises([]);

    const db = supabase();
    if (db) {
      const payload = {
        id: newWorkout.id,
        routine_id: newWorkout.routineId,
        routine_name: newWorkout.routineName,
        date: newWorkout.date
      };
      const { error } = await db.from('completed_workouts').insert([payload]);
      if (error) console.error("Supabase Error guardando workout completado:", error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      routines, 
      completedExercises, 
      goals, 
      hasCompletedOnboarding,
      exerciseLogs,
      completedWorkouts,
      isTrainingGlobal,
      trainingStartTimeGlobal,
      activeRoutineId,
      startTrainingGlobal,
      stopTrainingGlobal,
      addRoutine, 
      updateRoutine, 
      deleteRoutine, 
      toggleCompletedExercise,
      setGoals,
      completeOnboarding,
      addExerciseLog,
      addCompletedWorkout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
