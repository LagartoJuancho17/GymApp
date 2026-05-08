import { supabase } from './supabase';

export const forceUpdateRoutine = async (id: string, payload: any, fullRoutine: any) => {
  const db = supabase();
  if (!db) return false;
  
  // Try upserting instead of updating
  const upsertPayload = {
    ...fullRoutine,
    ...payload,
    assigned_day: payload.assigned_day !== undefined ? payload.assigned_day : fullRoutine.assignedDay,
  };
  delete upsertPayload.assignedDay;

  const { error } = await db.from('routines').upsert([upsertPayload]);
  if (error) {
    console.error("Force Upsert Error:", error);
    return false;
  }
  return true;
};
