import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

export function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const db = supabase();
      if (!db) {
        toast.error("Supabase no está configurado.");
        setIsLoading(false);
        return;
      }
      
      const { error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast.error(error.message || 'Error al iniciar sesión con Google');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gym-dark text-white text-center">
      <div className="w-20 h-20 bg-gym-lime/20 rounded-full flex items-center justify-center mb-8">
        <Dumbbell className="w-10 h-10 text-gym-lime" />
      </div>
      <h1 className="text-3xl font-display font-bold mb-2">GymApp</h1>
      <p className="text-gray-400 mb-10 max-w-xs">
        Inicia sesión para guardar tus rutinas y tu progreso en la nube de forma segura.
      </p>
      
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full max-w-xs bg-white text-black py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-70"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
        {isLoading ? 'Conectando...' : 'Continuar con Google'}
      </button>
    </div>
  );
}
