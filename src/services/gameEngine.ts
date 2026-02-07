// ============================================
// FIVE01 Darts - Game Engine Service
// ============================================

import { supabase } from '@/lib/supabase';

export interface DartThrow {
  score: number;
  multiplier: 1 | 2 | 3;
  segment?: string;
}

export interface Visit {
  id: string;
  match_id: string;
  leg_id: string;
  player_id: string;
  dart1_score: number;
  dart1_multiplier: number;
  dart2_score: number;
  dart2_multiplier: number;
  dart3_score: number;
  dart3_multiplier: number;
  total_scored: number;
  is_bust: boolean;
  is_checkout: boolean;
  created_at: string;
}

export interface Leg {
  id: string;
  match_id: string;
  leg_number: number;
  winner_id: string | null;
  status: 'active' | 'completed';
  created_at: string;
}

export interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  current_leg_id: string | null;
  current_player_id: string;
  player1_score: number;
  player2_score: number;
  player1_legs: number;
  player2_legs: number;
  status: 'pending' | 'active' | 'completed';
  game_mode: string;
  legs_to_win: number;
  double_out: boolean;
  winner_id: string | null;
  created_at: string;
}

export interface GameState {
  match: Match;
  currentLeg: Leg;
  visits: Visit[];
  currentPlayerId: string;
  player1Score: number;
  player2Score: number;
  isMyTurn: boolean;
  players: Record<string, { display_name: string; username: string }>;
}

export class GameEngine {
  private matchId: string;
  private userId: string;
  private onStateChange?: (state: GameState) => void;
  private onTurnChange?: (isMyTurn: boolean) => void;

  private subscription?: any;

  constructor(matchId: string, userId: string) {
    this.matchId = matchId;
    this.userId = userId;
  }

  initialize(
    onStateChange: (state: GameState) => void,
    onTurnChange: (isMyTurn: boolean) => void,
    _onGameEnd?: () => void,
    _onLegEnd?: () => void
  ) {
    this.onStateChange = onStateChange;
    this.onTurnChange = onTurnChange;
    this.loadGameState();
    this.subscribeToUpdates();
  }

  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async loadGameState() {
    // Load initial game state from database
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', this.matchId)
      .single();

    if (match) {
      this.updateGameState(match);
    }
  }

  private subscribeToUpdates() {
    this.subscription = supabase
      .channel(`match:${this.matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${this.matchId}`
      }, (payload: any) => {
        this.updateGameState(payload.new);
      })
      .subscribe();
  }

  private updateGameState(match: any) {
    if (!match) return;
    
    const isMyTurn = match.current_player_id === this.userId;
    
    const gameState: GameState = {
      match,
      currentLeg: { id: match.current_leg_id, leg_number: 1 } as Leg,
      visits: [],
      currentPlayerId: match.current_player_id,
      player1Score: match.player1_score,
      player2Score: match.player2_score,
      isMyTurn,
      players: {}
    };

    this.onStateChange?.(gameState);
    this.onTurnChange?.(isMyTurn);
  }

  async submitDartThrow(darts: DartThrow[]) {
    // Implementation for submitting darts
    const totalScored = darts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);
    
    const { error } = await supabase
      .from('visits')
      .insert({
        match_id: this.matchId,
        player_id: this.userId,
        total_scored: totalScored,
        dart1_score: darts[0]?.score || 0,
        dart1_multiplier: darts[0]?.multiplier || 1,
        dart2_score: darts[1]?.score || 0,
        dart2_multiplier: darts[1]?.multiplier || 1,
        dart3_score: darts[2]?.score || 0,
        dart3_multiplier: darts[2]?.multiplier || 1,
      });

    if (error) throw error;
  }

  getCheckoutSuggestion(score: number): string {
    const checkouts: Record<number, string> = {
      170: 'T20 T20 DB', 167: 'T20 T19 DB', 164: 'T20 T18 DB', 161: 'T20 T17 DB',
      160: 'T20 T20 D20', 158: 'T20 T20 D19', 157: 'T20 T19 D20', 156: 'T20 T20 D18',
      155: 'T20 T19 D19', 154: 'T20 T18 D20', 153: 'T20 T19 D18', 152: 'T20 T20 D16',
      151: 'T20 T17 D20', 150: 'T20 T18 D18', 149: 'T20 T19 D16', 148: 'T20 T16 D20',
      147: 'T20 T17 D18', 146: 'T20 T18 D16', 145: 'T20 T15 D20', 144: 'T20 T20 D12',
      143: 'T20 T17 D16', 142: 'T20 T14 D20', 141: 'T20 T15 D18', 140: 'T20 T20 D10',
      139: 'T20 T13 D20', 138: 'T20 T18 D12', 137: 'T20 T19 D10', 136: 'T20 T20 D8',
      135: 'T20 T17 D12', 134: 'T20 T14 D16', 133: 'T20 T19 D8', 132: 'T20 T16 D12',
      131: 'T20 T13 D16', 130: 'T20 T20 D5', 129: 'T20 T19 D6', 128: 'T20 T18 D7',
      127: 'T20 T17 D8', 126: 'T20 T16 D9', 125: 'T20 T15 D10', 124: 'T20 T14 D11',
      123: 'T20 T13 D12', 122: 'T20 T12 D13', 121: 'T20 T11 D14', 120: 'T20 20 D20',
      40: 'D20', 36: 'D18', 32: 'D16', 30: 'D15', 24: 'D12', 20: 'D10', 
      16: 'D8', 12: 'D6', 10: 'D5', 8: 'D4', 6: 'D3', 4: 'D2', 2: 'D1'
    };
    return checkouts[score] || '';
  }

  // Static methods for standalone use
  static async submitVisit(
    matchId: string,
    legId: string,
    playerId: string,
    darts: DartThrow[],
    currentScore: number,
    doubleOut: boolean
  ) {
    const totalScored = darts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);
    const remainingAfter = currentScore - totalScored;
    const isBust = remainingAfter < 0 || remainingAfter === 1;
    const isCheckout = remainingAfter === 0;
    
    // Validate double-out
    if (isCheckout && doubleOut) {
      const lastDart = darts[darts.length - 1];
      if (lastDart.multiplier !== 2 && lastDart.score !== 50) {
        throw new Error('Must finish on a double');
      }
    }

    // Record the visit
    const { data: visit, error } = await supabase
      .from('visits')
      .insert({
        match_id: matchId,
        leg_id: legId,
        player_id: playerId,
        dart1_score: darts[0]?.score || 0,
        dart1_multiplier: darts[0]?.multiplier || 0,
        dart2_score: darts[1]?.score || 0,
        dart2_multiplier: darts[1]?.multiplier || 0,
        dart3_score: darts[2]?.score || 0,
        dart3_multiplier: darts[2]?.multiplier || 0,
        total_scored: isBust ? 0 : totalScored,
        is_bust: isBust,
        is_checkout: isCheckout,
      })
      .select()
      .single();

    if (error) throw error;

    // Handle checkout
    if (isCheckout && !isBust) {
      await GameEngine.handleLegWin(matchId, legId, playerId);
    } else {
      // Switch turns
      const { data: match } = await supabase
        .from('matches')
        .select('player1_id, player2_id')
        .eq('id', matchId)
        .single();

      if (match) {
        const nextPlayerId = match.player1_id === playerId ? match.player2_id : match.player1_id;

        await supabase
          .from('matches')
          .update({ current_player_id: nextPlayerId })
          .eq('id', matchId);
      }
    }

    return { visit, isBust, isCheckout, remaining: isBust ? currentScore : remainingAfter };
  }

  // Handle leg win
  static async handleLegWin(matchId: string, legId: string, winnerId: string) {
    // Update leg
    await supabase
      .from('legs')
      .update({ winner_id: winnerId, status: 'completed' })
      .eq('id', legId);

    // Get match details
    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) return;

    const isPlayer1 = match.player1_id === winnerId;
    const newPlayer1Legs = isPlayer1 ? match.player1_legs + 1 : match.player1_legs;
    const newPlayer2Legs = !isPlayer1 ? match.player2_legs + 1 : match.player2_legs;

    // Check for match win
    if (newPlayer1Legs >= match.legs_to_win || newPlayer2Legs >= match.legs_to_win) {
      await supabase
        .from('matches')
        .update({
          player1_legs: newPlayer1Legs,
          player2_legs: newPlayer2Legs,
          winner_id: winnerId,
          status: 'completed',
        })
        .eq('id', matchId);
    } else {
      // Create new leg
      const { data: newLeg } = await supabase
        .from('legs')
        .insert({
          match_id: matchId,
          leg_number: (await GameEngine.getLegCount(matchId)) + 1,
          status: 'active',
        })
        .select()
        .single();

      if (newLeg) {
        await supabase
          .from('matches')
          .update({
            player1_legs: newPlayer1Legs,
            player2_legs: newPlayer2Legs,
            current_leg_id: newLeg.id,
            current_player_id: match.player1_id, // Alternate throw
            player1_score: match.game_mode === '501' ? 501 : 301,
            player2_score: match.game_mode === '501' ? 501 : 301,
          })
          .eq('id', matchId);
      }
    }
  }

  // Get leg count for match
  static async getLegCount(matchId: string) {
    const { count } = await supabase
      .from('legs')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId);
    return count || 0;
  }

  // Get match state
  static async getMatchState(matchId: string) {
    const { data: match } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(username, display_name),
        player2:player2_id(username, display_name)
      `)
      .eq('id', matchId)
      .single();

    return match;
  }

  // Get visits for leg
  static async getVisits(legId: string) {
    const { data } = await supabase
      .from('visits')
      .select('*')
      .eq('leg_id', legId)
      .order('created_at', { ascending: true });

    return data || [];
  }

  // Subscribe to match updates
  static subscribeToMatch(matchId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`
      }, callback)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'visits',
        filter: `match_id=eq.${matchId}`
      }, callback)
      .subscribe();
  }
}

// Legacy gameEngine object for backward compatibility
export const gameEngine = {
  submitVisit: GameEngine.submitVisit,
  handleLegWin: GameEngine.handleLegWin,
  getLegCount: GameEngine.getLegCount,
  getMatchState: GameEngine.getMatchState,
  getVisits: GameEngine.getVisits,
  subscribeToMatch: GameEngine.subscribeToMatch
};

export default gameEngine;
