-- Agrega la columna weekly_training_goal a la tabla goals
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE goals
ADD COLUMN IF NOT EXISTS weekly_training_goal integer DEFAULT NULL;
