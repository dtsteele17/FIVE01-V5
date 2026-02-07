import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jzqysspbfhfetllmduvh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cXlzc3BiZmhmZXRsbG1kdXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDIwODgsImV4cCI6MjA4NTkxODA4OH0.2ngTufXnW8s5QWCTeHw-s5nThC-iGy-HYD6UdFDabd8';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const subscribeToMatch = (matchId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`match:${matchId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'visits',
      filter: `match_id=eq.${matchId}`,
    }, callback)
    .subscribe();
};
