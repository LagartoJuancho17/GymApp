-- Supabase SQL Schema for the applet
-- Ejecuta este script en el SQL Editor de Supabase
-- IMPORTANTE: Corre este script completo nuevamente.

CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    assigned_day INTEGER NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS exercise_logs (
    id UUID PRIMARY KEY,
    date TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    reps INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY,
    text TEXT NOT NULL,
    timeframe TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS completed_workouts (
    id UUID PRIMARY KEY,
    routine_id TEXT NOT NULL,
    routine_name TEXT NOT NULL,
    date TEXT NOT NULL
);

-- ==========================================
-- PERMISOS PUBLICOS (Deshabilitar seguridad para pruebas)
-- ==========================================

-- Habilitar RLS para poder agregar políticas explícitas
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_workouts ENABLE ROW LEVEL SECURITY;

-- Borrar políticas viejas por las dudas
DROP POLICY IF EXISTS "Allow public access routines" ON routines;
DROP POLICY IF EXISTS "Allow public access exercise_logs" ON exercise_logs;
DROP POLICY IF EXISTS "Allow public access goals" ON goals;
DROP POLICY IF EXISTS "Allow public access completed_workouts" ON completed_workouts;

-- Crear políticas que permiten leer, escribir, y borrar libremente a cualquiera
CREATE POLICY "Allow public access routines" ON routines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access exercise_logs" ON exercise_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access completed_workouts" ON completed_workouts FOR ALL USING (true) WITH CHECK (true);

-- Recargar cache de Supabase (por si acaso)
NOTIFY pgrst, 'reload schema';
