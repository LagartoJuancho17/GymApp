export type ExerciseType = 'Potencia' | 'Movilidad' | 'Zona Media' | 'Fuerza' | 'Estructura' | 'Accesorio';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  trackingType?: 'reps' | 'time';
  weight: number;
  reps: number;
  sets: number;
  rir?: number;
}

export interface ExerciseLog {
  id: string;
  date: string;
  exerciseName: string;
  type?: ExerciseType;
  trackingType?: 'reps' | 'time';
  weight: number;
  reps: number;
  rir?: number;
}

export interface Goal {
  id: string;
  text: string;
  timeframe: 'Semanal' | 'Mensual';
}

export interface CompletedWorkout {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
}

export interface Routine {
  id: string;
  name: string;
  assignedDay: number; // 0 (Monday) to 6 (Sunday)
  exercises: Exercise[];
}

export const INITIAL_LOGS: ExerciseLog[] = [
  { id: 'l1', date: '2026-05-01T10:00:00Z', exerciseName: 'Sentadilla', type: 'Fuerza', weight: 60, reps: 8 },
  { id: 'l2', date: '2026-05-04T10:00:00Z', exerciseName: 'Sentadilla', type: 'Fuerza', weight: 65, reps: 8 },
  { id: 'l3', date: '2026-05-05T10:00:00Z', exerciseName: 'Sentadilla', type: 'Fuerza', weight: 70, reps: 8 },
  { id: 'l4', date: '2026-05-01T10:00:00Z', exerciseName: 'Press Banca', type: 'Potencia', weight: 40, reps: 5 },
  { id: 'l5', date: '2026-05-04T10:00:00Z', exerciseName: 'Press Banca', type: 'Potencia', weight: 45, reps: 5 },
  { id: 'l6', date: '2026-05-05T10:00:00Z', exerciseName: 'Press Banca', type: 'Potencia', weight: 47.5, reps: 5 },
  { id: 'l7', date: '2026-05-01T10:00:00Z', exerciseName: 'Prensa', type: 'Estructura', weight: 100, reps: 10 },
  { id: 'l8', date: '2026-05-04T10:00:00Z', exerciseName: 'Prensa', type: 'Estructura', weight: 110, reps: 10 },
  { id: 'l9', date: '2026-05-05T10:00:00Z', exerciseName: 'Prensa', type: 'Estructura', weight: 120, reps: 10 },
];

// Some dummy initial data
export const INITIAL_ROUTINES: Routine[] = [
  {
    id: '1',
    name: 'Día de Piernas',
    assignedDay: 2, // Wednesday
    exercises: [
      { id: '1-1', name: 'Sentadilla', type: 'Fuerza', weight: 80, reps: 8, sets: 4 },
      { id: '1-2', name: 'Prensa', type: 'Estructura', weight: 120, reps: 10, sets: 4 },
    ]
  },
  {
    id: '2',
    name: 'Upper Body Power',
    assignedDay: 0, // Monday
    exercises: [
      { id: '2-1', name: 'Press Banca', type: 'Potencia', weight: 60, reps: 5, sets: 5 },
      { id: '2-2', name: 'Remo con Barra', type: 'Fuerza', weight: 50, reps: 8, sets: 4 },
    ]
  }
];
