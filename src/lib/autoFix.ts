import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export const autoFixOrphans = async (userId: string) => {
  const db = supabase();
  if (!db || !userId) return false;

  try {
    // 1. Fetch all routines (including orphans if public read is on)
    const { data: routines } = await db.from('routines').select('*');
    if (!routines) return false;

    let fixedAnything = false;
    
    // Find orphans (where user_id is null)
    const orphans = routines.filter(r => r.user_id === null || r.user_id === undefined);
    
    for (const orphan of orphans) {
      // Create a clone with a new ID
      const clonePayload = {
        id: uuidv4(),
        name: orphan.name,
        assigned_day: orphan.assigned_day,
        exercises: orphan.exercises,
        // user_id will automatically be set to the authenticated user's ID by Supabase!
      };
      
      const { error } = await db.from('routines').insert([clonePayload]);
      if (!error) {
        fixedAnything = true;
      }
    }
    
    return fixedAnything;
  } catch (e) {
    console.error(e);
    return false;
  }
};
