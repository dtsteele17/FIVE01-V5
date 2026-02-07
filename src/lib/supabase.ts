import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://snrwbizxmefihhrwcdjl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucndiaXp4bWVmaWhocndjZGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODU2OTcsImV4cCI6MjA4NTk2MTY5N30._UFM-7hgi1w7WUcx_eli9l8mnSZZmbIDYc2-8_pS4ks';

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
