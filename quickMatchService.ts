import { supabase } from '@/lib/supabase';

export interface Match {
  id: string;
  status: string;
  game_mode_id: string;
  legs_to_win: number;
  player1_id: string;
  player2_id: string | null;
  current_player_id: string | null;
  is_ranked: boolean;
  is_private: boolean;
  is_vs_bot: boolean;
  created_at: string;
  started_at: string | null;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const quickMatchService = {
  // Create a new lobby
  async createLobby(gameModeId: string, legsToWin: number = 3, doubleOut: boolean = true) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('matches')
      .insert({
        game_mode_id: gameModeId,
        player1_id: user.user.id,
        status: 'waiting',
        legs_to_win: legsToWin,
        is_ranked: false,
        is_private: false,
        double_out: doubleOut,
        is_vs_bot: false,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create lobby error:', error);
      throw new Error(`Failed to create lobby: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Failed to create lobby: No data returned');
    }
    
    return data as Match;
  },

  // Get all available lobbies
  async getAvailableLobbies() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(username, display_name, avatar_url)
      `)
      .eq('status', 'waiting')
      .is('player2_id', null)
      .eq('is_private', false)
      .eq('is_vs_bot', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get lobbies error:', error);
      throw error;
    }
    return (data || []) as (Match & { player1: Profile })[];
  },

  // Join an existing lobby
  async joinLobby(matchId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const userId = user.user.id;

    // First check if lobby is still available
    const { data: checkData, error: checkError } = await supabase
      .from('matches')
      .select('status, player1_id, player2_id')
      .eq('id', matchId)
      .single();

    if (checkError || !checkData) {
      throw new Error('Lobby not found');
    }

    if (checkData.player1_id === userId) {
      throw new Error('Cannot join your own lobby');
    }

    if (checkData.status !== 'waiting' || checkData.player2_id) {
      throw new Error('Lobby no longer available');
    }

    const { data, error } = await supabase
      .from('matches')
      .update({
        player2_id: user.user.id,
        status: 'active',
        started_at: new Date().toISOString(),
        current_player_id: checkData.player1_id,
      })
      .eq('id', matchId)
      .eq('status', 'waiting')
      .is('player2_id', null)
      .select('*')
      .single();

    if (error) {
      console.error('Join lobby error:', error);
      throw new Error(`Failed to join lobby: ${error.message}`);
    }
    if (!data) {
      throw new Error('Lobby no longer available');
    }
    return data as Match;
  },

  // Cancel/delete lobby
  async cancelLobby(matchId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .eq('player1_id', user.user.id)
      .eq('status', 'waiting');

    if (error) {
      console.error('Cancel lobby error:', error);
      throw error;
    }
  },

  // Get a specific match
  async getMatch(matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(username, display_name, avatar_url),
        player2:player2_id(username, display_name, avatar_url)
      `)
      .eq('id', matchId)
      .single();

    if (error) throw error;
    return data as Match & { player1?: Profile; player2?: Profile };
  },

  // Subscribe to match changes
  subscribeToMatch(matchId: string, onUpdate: (match: Match) => void) {
    return supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          onUpdate(payload.new as Match);
        }
      )
      .subscribe();
  },

  // Subscribe to all match changes
  subscribeToAllMatches(onUpdate: () => void) {
    return supabase
      .channel('all-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
  }
};

export default quickMatchService;
