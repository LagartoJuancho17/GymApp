import { createClient } from '@supabase/supabase-js';
const url = 'https://ktykhxjrgnpguqvmtcej.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0eWtoeGpyZ25wZ3Vxdm10Y2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NTMwMTMsImV4cCI6MjA5MzUyOTAxM30.uVvPp--KvUwA1P1TgT-Yi5rwNwVOzjEOGj6-8tVUYGA';
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.from('routines').select('*');
  console.log("Routines Data:", data);
  console.log("Error:", error);
}
test();
