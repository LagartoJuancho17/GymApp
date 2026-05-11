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
  updateRoutine: (id: string, routine: Partial<Routine>, silent?: boolean) => void;
  deleteRoutine: (id: string) => void;
    toggleCompletedExercise: (id: string) => void;
  setGoals: (goals: Goal[]) => void;
  completeOnboarding: () => void;
  addExerciseLog: (log: Omit<ExerciseLog, 'id'>) => void;
  completedWorkouts: CompletedWorkout[];
  addCompletedWorkout: (workout: Omit<CompletedWorkout, 'id'>) => void;
  deleteCompletedWorkout: (id: string) => void;
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
      if (session?.user?.user_metadata?.has_completed_onboarding) {
        setHasCompletedOnboarding(true);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // NUKE EFFECT - Automatic wipe as requested by user
  useEffect(() => {
    if (user && !localStorage.getItem('nuke_done_v3')) {
      const nukeDb = async () => {
        const db = supabase();
        if (!db) return;
        
        toast.loading("Eliminando toda la basura de la base de datos de forma automática...");
        
        // We delete everything we can access
        const p1 = db.from('exercise_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const p2 = db.from('completed_workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        const p3 = db.from('routines').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        const results = await Promise.all([p1, p2, p3]);
        
        const hasError = results.some(r => r.error);
        if (hasError) {
           toast.error("ERROR GRAVE: Supabase bloqueó el borrado. ¡DEBES CORRER EL SQL SCRIPT DE PERMISOS!");
        } else {
           localStorage.setItem('nuke_done_v3', 'true');
           toast.success("¡Base de datos purgada con éxito!");
           setTimeout(() => window.location.reload(), 1500);
        }
      };
      nukeDb();
    }
  }, [user]);

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
          const ownedRoutines = dbRoutines.filter((r: any) => r.user_id === user.id);
          setRoutines(ownedRoutines.map((r: any) => ({
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
          const ownedLogs = dbLogs.filter((l: any) => l.user_id === user.id);
          setExerciseLogs(ownedLogs.map((l: any) => ({
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
          setGoalsState(dbGoals.filter((g: any) => g.user_id === user.id).map((g: any) => ({
            id: g.id,
            text: g.text,
            timeframe: g.timeframe,
            weeklyTrainingGoal: g.weekly_training_goal != null ? Number(g.weekly_training_goal) : undefined
          })));
        } else {
          setGoalsState([]);
        }

        // Check onboarding status from user metadata
        if (user.user_metadata?.has_completed_onboarding) {
          setHasCompletedOnboarding(true);
        } else {
          // Si no tiene el flag, mostramos onboarding a menos que ya tuviera metas (retrocompatibilidad)
          if (dbGoals && dbGoals.length > 0) {
            setHasCompletedOnboarding(true);
            await db.auth.updateUser({ data: { has_completed_onboarding: true } });
          } else {
            setHasCompletedOnboarding(false);
          }
        }

        // Fetch completed workouts
        const { data: dbWorkouts, error: workoutsError } = await db.from('completed_workouts').select('*');
        if (workoutsError) console.error("Supabase Error fetch completed_workouts:", workoutsError);
        else if (dbWorkouts && dbWorkouts.length > 0) {
          const ownedWorkouts = dbWorkouts.filter((w: any) => w.user_id === user.id);
          setCompletedWorkouts(ownedWorkouts.map((w: any) => ({
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
    // Optimistic update
    setRoutines(prev => [...prev, newRoutine]);

    const db = supabase();
    if (db) {
      try {
        const payload = {
          id: newRoutine.id,
          name: newRoutine.name,
          assigned_day: newRoutine.assignedDay,
          exercises: newRoutine.exercises
        };
        const { error } = await db.from('routines').insert([payload]);
        if (error) {
          console.error("Supabase Error Insertando Rutina:", error);
          toast.error(`Error guardando rutina en base de datos: ${error.message}`);
          // Revert on error
          setRoutines(prev => prev.filter(r => r.id !== newRoutine.id));
        } else {
          toast.success("Rutina creada correctamente");
        }
      } catch (err: any) {
        console.error("Excepción Insertando Rutina:", err);
        toast.error(`Error de conexión al guardar rutina: ${err.message}`);
        // Revert on error
        setRoutines(prev => prev.filter(r => r.id !== newRoutine.id));
      }
    }
  };

  const updateRoutine = async (id: string, updatedFields: Partial<Routine>, silent = false) => {
    // Save original in case we need to revert
    const originalRoutine = routines.find(r => r.id === id);
    if (!originalRoutine) return;
    
    // Optimistic update
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));

    const db = supabase();
    if (db) {
      try {
        const payload: any = { ...updatedFields };
        if (payload.assignedDay !== undefined) {
          payload.assigned_day = payload.assignedDay;
          delete payload.assignedDay;
        }
        const { error } = await db.from('routines').update(payload).eq('id', id);
        if (error) {
          console.error("Supabase Error Actualizando Rutina:", error);
          if (!silent) toast.error(`Error actualizando rutina en base de datos: ${error.message}`);
          // Revert
          setRoutines(prev => prev.map(r => r.id === id ? originalRoutine : r));
        } else {
          if (!silent) toast.success("Rutina actualizada");
        }
      } catch (err: any) {
        console.error("Excepción Actualizando Rutina:", err);
        toast.error(`Error de conexión al actualizar rutina: ${err.message}`);
        // Revert
        setRoutines(prev => prev.map(r => r.id === id ? originalRoutine : r));
      }
    }
  };

  const deleteRoutine = async (id: string) => {
    // Save original in case we need to revert
    const routineToRestore = routines.find(r => r.id === id);
    if (!routineToRestore) return;

    // Optimistic update
    setRoutines(prev => prev.filter(r => r.id !== id));

    const db = supabase();
    if (db) {
      try {
        const { error } = await db.from('routines').delete().eq('id', id);
        if (error) {
          console.error("Supabase Error Eliminando Rutina:", error);
          toast.error(`Error eliminando rutina en base de datos: ${error.message}`);
          // Revert
          setRoutines(prev => [...prev, routineToRestore]);
        } else {
          toast.success("Eliminado correctamente");
        }
      } catch (err: any) {
        console.error("Excepción Eliminando Rutina:", err);
        toast.error(`Error de conexión al eliminar rutina: ${err.message}`);
        // Revert
        setRoutines(prev => [...prev, routineToRestore]);
      }
    }
  };

  const toggleCompletedExercise = (id: string) => {
    setCompletedExercises(prev => 
      prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
    );
  };

  const setGoals = async (newGoals: Goal[]) => {
    const currentGoalsIds = goals.map(g => g.id);
    const newGoalsIds = newGoals.map(g => g.id);
    const goalsToDelete = currentGoalsIds.filter(id => !newGoalsIds.includes(id));

    setGoalsState(newGoals);
    const db = supabase();
    if (db) {
      if (goalsToDelete.length > 0) {
        await db.from('goals').delete().in('id', goalsToDelete);
      }
      if (newGoals.length > 0) {
        // Map camelCase to snake_case for Supabase
        const payload = newGoals.map(g => ({
          id: g.id,
          text: g.text,
          timeframe: g.timeframe,
          weekly_training_goal: g.weeklyTrainingGoal ?? null
        }));
        const { error } = await db.from('goals').upsert(payload);
        if (error) console.error("Supabase Error guardando Metas:", error);
      }
    }
  };
  
  const completeOnboarding = async () => {
    setHasCompletedOnboarding(true);
    const db = supabase();
    if (db && user) {
      await db.auth.updateUser({ data: { has_completed_onboarding: true } });
    }
  };

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

  const deleteCompletedWorkout = async (id: string) => {
    const workoutToRestore = completedWorkouts.find(w => w.id === id);
    if (!workoutToRestore) return;

    setCompletedWorkouts(prev => prev.filter(w => w.id !== id));
    
    const db = supabase();
    if (db) {
      try {
        const { error } = await db.from('completed_workouts').delete().eq('id', id);
        if (error) {
          console.error("Supabase Error eliminando workout:", error);
          toast.error(`Error eliminando entrenamiento: ${error.message}`);
          setCompletedWorkouts(prev => [...prev, workoutToRestore]);
        } else {
          toast.success("Entrenamiento eliminado");
        }
      } catch (err: any) {
        console.error("Excepción eliminando workout:", err);
        toast.error(`Error de red al eliminar: ${err.message}`);
        setCompletedWorkouts(prev => [...prev, workoutToRestore]);
      }
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
      addCompletedWorkout,
      deleteCompletedWorkout
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
