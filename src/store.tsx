import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Routine, INITIAL_ROUTINES, Goal, ExerciseLog, INITIAL_LOGS, CompletedWorkout } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  isLoadingAuth: boolean;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
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
    const db = supabase();
    if (!db) {
      setIsLoadingAuth(false);
      // Fallback for no Supabase config
      setRoutines(INITIAL_ROUTINES);
      setExerciseLogs(INITIAL_LOGS);
      return;
    }

    // Check active sessions and sets the user
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSupabaseData = async () => {
      const db = supabase();
      if (!db || !user) {
        if (!db) {
           // mock data solo si no hay supabase, si no está logeado que espere el login
           setRoutines(INITIAL_ROUTINES);
        }
        return;
      }

      try {
        // Fetch Rutinas
        const { data: dbRoutines, error: routinesError } = await db.from('routines').select('*');
        if (routinesError) {
          console.error("Supabase Error fetch rutinas:", routinesError);
        } else if (dbRoutines && dbRoutines.length > 0) {
          setRoutines(dbRoutines.map((r: any) => ({
            id: r.id,
            name: r.name,
            assignedDay: r.assigned_day !== undefined ? r.assigned_day : r.assignedDay,
            exercises: r.exercises
          })));
        } else {
          setRoutines([]);
        }

        // Fetch logs
        const { data: dbLogs, error: logsError } = await db.from('exercise_logs').select('*');
        if (logsError) console.error("Supabase Error fetch logs:", logsError);
        else if (dbLogs && dbLogs.length > 0) {
          setExerciseLogs(dbLogs.map((l: any) => ({
            id: l.id,
            date: l.date,
            weight: Number(l.weight),
            reps: Number(l.reps),
            type: l.type,
            trackingType: l.tracking_type,
            rir: l.rir !== null ? Number(l.rir) : undefined,
            exerciseName: l.exercise_name !== undefined ? l.exercise_name : l.exerciseName
          })));
        } else {
          setExerciseLogs([]);
        }

        // Fetch goals
        const { data: dbGoals, error: goalsError } = await db.from('goals').select('*');
        if (goalsError) console.error("Supabase Error fetch goals:", goalsError);
        else if (dbGoals && dbGoals.length > 0) {
          setGoalsState(dbGoals);
          setHasCompletedOnboarding(true);
        } else {
          setGoalsState([]);
          setHasCompletedOnboarding(false);
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
        } else {
          setCompletedWorkouts([]);
        }

      } catch (err) {
        console.error("Error al cargar data de Supabase:", err);
      }
    };

    fetchSupabaseData();
  }, [user]);

  const signOut = async () => {
    const db = supabase();
    if (db) {
      await db.auth.signOut();
      setUser(null);
      setRoutines([]);
      setGoalsState([]);
      setExerciseLogs([]);
      setCompletedWorkouts([]);
      setHasCompletedOnboarding(false);
    }
  };

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
      const { error } = await db.from('routines').insert([payload]);
      if (error) {
        console.error("Supabase Error Insertando Rutina:", error);
        toast.error(`Error guardando rutina: ${error.message}`);
      } else {
        toast.success("Rutina creada correctamente");
      }
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
        exercise_name: newLog.exerciseName,
        type: newLog.type,
        tracking_type: newLog.trackingType,
        rir: newLog.rir
      };
      const { error } = await db.from('exercise_logs').insert([payload]);
      if (error) console.error("Supabase Error guardando log:", error);
    }
  };

  const addCompletedWorkout = async (workout: Omit<CompletedWorkout, 'id'>) => {
    const newWorkout = { ...workout, id: uuidv4() };
    setCompletedWorkouts(prev => [...prev, newWorkout]);
    
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
      user,
      isLoadingAuth,
      signOut,
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
