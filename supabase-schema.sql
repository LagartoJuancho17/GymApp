-- Supabase SQL Schema for the applet
-- Ejecuta este script en el SQL Editor de Supabase
-- IMPORTANTE: Corre este script completo nuevamente.

CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    name TEXT NOT NULL,
    assigned_day INTEGER NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS exercise_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    date TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    reps INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    text TEXT NOT NULL,
    timeframe TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS completed_workouts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    routine_id TEXT NOT NULL,
    routine_name TEXT NOT NULL,
    date TEXT NOT NULL
);

-- ==========================================
-- ACTUALIZAR TABLAS EXISTENTES (Añadir user_id)
-- ==========================================
ALTER TABLE routines ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE exercise_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE completed_workouts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- ==========================================
-- PERMISOS PRIVADOS (Seguridad Multi-usuario)
-- ==========================================

-- Habilitar RLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_workouts ENABLE ROW LEVEL SECURITY;

-- Borrar políticas viejas por las dudas
DROP POLICY IF EXISTS "Allow public access routines" ON routines;
DROP POLICY IF EXISTS "Allow public access exercise_logs" ON exercise_logs;
DROP POLICY IF EXISTS "Allow public access goals" ON goals;
DROP POLICY IF EXISTS "Allow public access completed_workouts" ON completed_workouts;

DROP POLICY IF EXISTS "Users can only access their own routines" ON routines;
DROP POLICY IF EXISTS "Users can only access their own exercise_logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users can only access their own goals" ON goals;
DROP POLICY IF EXISTS "Users can only access their own completed_workouts" ON completed_workouts;

-- Crear políticas para que el usuario solo pueda leer/escribir SU propia data (basado en auth.uid())
CREATE POLICY "Users can only access their own routines" ON routines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only access their own exercise_logs" ON exercise_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only access their own goals" ON goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only access their own completed_workouts" ON completed_workouts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recargar cache de Supabase (por si acaso)
NOTIFY pgrst, 'reload schema';
