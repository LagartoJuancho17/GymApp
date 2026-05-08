import React, { useEffect, useState } from 'react';
import { Shield, Users, Activity, Settings, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../store';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export function AdminScreen() {
  const { user } = useAppContext();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [totalRoutines, setTotalRoutines] = useState(0);
  const [routinesByUser, setRoutinesByUser] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [sqlNeeded, setSqlNeeded] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      const db = supabase();
      if (!db) return;

      try {
        const { data: profilesData, error: profilesError } = await db.from('profiles').select('*');
        if (profilesError) {
          if (profilesError.code === 'PGRST205') {
            setSqlNeeded(true);
          }
          console.error("Error fetching profiles", profilesError);
        } else if (profilesData) {
          setProfiles(profilesData);
        }

        const { data: routinesData, error: routinesError } = await db.from('routines').select('*');
        if (routinesError) {
          console.error("Error fetching routines", routinesError);
        } else if (routinesData) {
          setTotalRoutines(routinesData.length);
          
          const counts: Record<string, number> = {};
          routinesData.forEach((r: any) => {
            const uid = r.user_id || r.usuario_id;
            if (uid) {
              counts[uid] = (counts[uid] || 0) + 1;
            }
          });
          setRoutinesByUser(counts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <Shield className="text-red-500" size={24} />
        </div>
        <div>
          <h1 className="text-white font-display font-bold text-2xl">Panel de Admin</h1>
          <p className="text-gray-400 text-xs">Acceso exclusivo para {user?.email}</p>
        </div>
      </div>

      {sqlNeeded && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertTriangle className="text-orange-500 shrink-0" size={20} />
          <div>
            <h4 className="text-orange-500 font-bold text-sm mb-1">¡Falta configurar Supabase!</h4>
            <p className="text-orange-200/70 text-xs">Para ver la lista de usuarios, debes ejecutar el script SQL de configuración en tu base de datos de Supabase.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1C1C24] p-5 rounded-3xl border border-white/5 flex flex-col relative overflow-hidden">
          <Users size={24} className="text-gym-lime mb-2" />
          <h3 className="font-display font-bold text-3xl text-white mb-1">
            {loading ? '...' : (sqlNeeded ? '?' : profiles.length)}
          </h3>
          <p className="text-xs text-gray-500 font-medium">Usuarios Registrados</p>
        </div>
        <div className="bg-[#1C1C24] p-5 rounded-3xl border border-white/5 flex flex-col relative overflow-hidden">
          <Activity size={24} className="text-gym-purple mb-2" />
          <h3 className="font-display font-bold text-3xl text-white mb-1">
            {loading ? '...' : totalRoutines}
          </h3>
          <p className="text-xs text-gray-500 font-medium">Rutinas Creadas</p>
        </div>
      </div>

      <h2 className="text-white font-display font-bold text-xl mb-4">Lista de Usuarios</h2>
      
      <div className="space-y-3 pb-8">
        {loading && <p className="text-gray-500 text-sm">Cargando usuarios...</p>}
        
        {!loading && profiles.map(profile => (
          <div key={profile.id} className="w-full bg-[#1C1C24] p-4 rounded-2xl border border-white/5 flex items-center justify-between transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500">
                {profile.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-white font-bold text-sm block truncate max-w-[150px]">{profile.full_name || 'Sin Nombre'}</span>
                <span className="text-gray-500 text-xs truncate max-w-[150px] block">{profile.email}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-gym-lime font-bold font-display text-lg block">{routinesByUser[profile.id] || 0}</span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Rutinas</span>
            </div>
          </div>
        ))}

        {!loading && !sqlNeeded && profiles.length === 0 && (
          <p className="text-gray-500 text-sm">No se encontraron usuarios.</p>
        )}
      </div>
    </div>
  );
}
