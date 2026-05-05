/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: any = null;

export const supabase = () => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url') {
      console.warn("Faltan las credenciales de Supabase (VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY). Utilizando mock database por ahora.");
      return null;
    }
    
    // Auto-corregir si el usuario por error copió el /rest/v1 al final de la URL
    const cleanUrl = supabaseUrl.split('/rest/v1')[0].replace(/\/$/, '');
    
    supabaseInstance = createClient(cleanUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};
