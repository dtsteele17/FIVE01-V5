// ============================================
// FIVE01 Darts - Tournament Service
// ============================================

import { supabase } from '@/lib/supabase';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game_mode: string;
  max_participants: number;
  min_participants: number;
  current_participants?: number;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  registration_deadline: string;
  status: 'draft' | 'registering' | 'active' | 'completed' | 'cancelled';
  created_by: string;
  total_rounds: number;
  current_round: number;
  winner_id: string | null;
  created_at: string;
  creator?: {
    username: string;
    display_name: string;
  };
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  player_id: string;
  seed: number;
  status: 'registered' | 'checked_in' | 'eliminated';
  checked_in: boolean;
  joined_at: string;
  player?: {
    username: string;
    display_name: string;
  };
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  winner_id: string | null;
  status: 'pending' | 'active' | 'completed' | 'bye';
  next_match_id: string | null;
  next_match_position: number | null;
  completed_at: string | null;
  player1?: {
    username: string;
    display_name: string;
  };
  player2?: {
    username: string;
    display_name: string;
  };
}

export const tournamentService = {
  // Get all tournaments
  async getTournaments(status?: string) {
    let query = supabase
      .from('tournaments')
      .select(`
        *,
        creator:created_by(username, display_name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data: data as Tournament[] | null, error };
  },

  // Get single tournament
  async getTournament(id: string) {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        creator:created_by(username, display_name)
      `)
      .eq('id', id)
      .single();

    return { data: data as Tournament | null, error };
  },

  // Create tournament
  async createTournament(data: {
    name: string;
    description: string;
    game_mode: string;
    max_participants: number;
    min_participants: number;
    entry_fee: number;
    prize_pool: number;
    registration_deadline: string;
  }) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert({
        ...data,
        created_by: userData.user?.id,
        status: 'registering',
      })
      .select()
      .single();

    return { data: tournament as Tournament | null, error };
  },

  // Join tournament
  async joinTournament(tournamentId: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        player_id: userData.user?.id,
        seed: 0,
        status: 'registered',
        checked_in: false,
      })
      .select()
      .single();

    return { data, error };
  },

  // Leave tournament
  async leaveTournament(tournamentId: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('player_id', userData.user?.id);

    return { error };
  },

  // Check in
  async checkIn(tournamentId: string) {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tournament_participants')
      .update({ 
        checked_in: true,
        status: 'checked_in'
      })
      .eq('tournament_id', tournamentId)
      .eq('player_id', userData.user?.id)
      .select()
      .single();

    return { data, error };
  },

  // Get participants
  async getParticipants(tournamentId: string) {
    const { data, error } = await supabase
      .from('tournament_participants')
      .select(`
        *,
        player:player_id(username, display_name)
      `)
      .eq('tournament_id', tournamentId)
      .order('seed', { ascending: true });

    return { data: data as TournamentParticipant[] | null, error };
  },

  // Get matches
  async getMatches(tournamentId: string) {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        player1:player1_id(username, display_name),
        player2:player2_id(username, display_name)
      `)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true });

    return { data: data as TournamentMatch[] | null, error };
  },

  // Start tournament
  async startTournament(tournamentId: string) {
    const { data, error } = await supabase
      .rpc('generate_tournament_bracket', {
        p_tournament_id: tournamentId
      });

    return { data, error };
  },

  // Update match result
  async updateMatchResult(
    matchId: string,
    player1Score: number,
    player2Score: number,
    winnerId: string
  ) {
    const { data, error } = await supabase
      .from('tournament_matches')
      .update({
        player1_score: player1Score,
        player2_score: player2Score,
        winner_id: winnerId,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single();

    return { data, error };
  },

  // Subscribe to tournament updates
  subscribeToTournament(tournamentId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`tournament:${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_matches',
          filter: `tournament_id=eq.${tournamentId}`
        },
        callback
      )
      .subscribe();
  }
};

export default tournamentService;
