// ============================================
// FIVE01 Darts - Statistics Service
// ============================================

import { supabase } from '@/lib/supabase';

export interface UserStatsDetailed {
  id: string;
  total_matches: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  overall_average: number;
  first_9_average: number;
  highest_3_dart: number;
  total_180s: number;
  total_140s: number;
  total_100s: number;
  total_ton_plus: number;
  highest_checkout: number;
  total_checkouts: number;
  checkout_percentage: number;
  finish_training_completed: number;
  around_clock_best_darts: number;
  jdc_best_score: number;
  bobs27_best_score: number;
  updated_at: string;
}

export interface MatchHistoryItem {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  status: string;
  started_at: string;
  ended_at: string;
  game_mode_id: string;
  legs_to_win: number;
  player1_legs_won: number;
  player2_legs_won: number;
  player1_username: string;
  player1_display_name: string;
  player2_username: string;
  player2_display_name: string;
  winner_display_name: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  value: number;
  avatar_url: string | null;
}

export interface DartHeatmapPoint {
  position_x: number;
  position_y: number;
  score: number;
  multiplier: number;
  segment: string;
}

export interface ProgressData {
  date: string;
  average: number;
  matches: number;
}

export const statsService = {
  // Get detailed stats for a user
  async getUserStats(userId: string): Promise<UserStatsDetailed | null> {
    const { data, error } = await supabase
      .from('user_stats_detailed')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data as UserStatsDetailed;
  },

  // Get match history for a user
  async getMatchHistory(userId: string, limit: number = 50): Promise<MatchHistoryItem[]> {
    const { data, error } = await supabase
      .from('match_history_view')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .limit(limit);

    if (error || !data) return [];
    return data as MatchHistoryItem[];
  },

  // Get global leaderboard
  async getLeaderboard(category: 'elo' | 'wins' | 'average' | 'checkouts' | '180s' = 'elo', limit: number = 100): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .rpc('get_leaderboard', {
        p_category: category,
        p_limit: limit
      });

    if (error || !data) return [];
    return data as LeaderboardEntry[];
  },

  // Get user's rank
  async getUserRank(userId: string, category: 'elo' | 'wins' | 'average' | 'checkouts' | '180s' = 'elo'): Promise<number> {
    const { data, error } = await supabase
      .rpc('get_user_rank', {
        p_user_id: userId,
        p_category: category
      });

    if (error || !data) return 0;
    return data as number;
  },

  // Get dart throw heatmap data
  async getDartHeatmap(userId: string, matchId?: string): Promise<DartHeatmapPoint[]> {
    let query = supabase
      .from('dart_throw_positions')
      .select('position_x, position_y, score, multiplier, segment')
      .eq('user_id', userId);

    if (matchId) {
      query = query.eq('match_id', matchId);
    }

    // Limit to recent throws for performance
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(500);

    if (error || !data) return [];
    return data as DartHeatmapPoint[];
  },

  // Get progress data (last 30 days)
  async getProgressData(userId: string): Promise<ProgressData[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('ended_at, player1_id, player2_id, player1_score, player2_score')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'completed')
      .gte('ended_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('ended_at', { ascending: true });

    if (error || !data) return [];

    // Group by date and calculate daily averages
    const dailyStats = new Map<string, { totalScore: number; matches: number }>();

    data.forEach((match: any) => {
      const date = new Date(match.ended_at).toISOString().split('T')[0];
      const isPlayer1 = match.player1_id === userId;
      const score = isPlayer1 ? match.player1_score : match.player2_score;

      const existing = dailyStats.get(date) || { totalScore: 0, matches: 0 };
      existing.totalScore += score;
      existing.matches += 1;
      dailyStats.set(date, existing);
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      average: stats.matches > 0 ? stats.totalScore / stats.matches : 0,
      matches: stats.matches
    }));
  },

  // Update stats after a match (called by trigger, but can be manual)
  async updateStats(userId: string, stats: Partial<UserStatsDetailed>) {
    const { error } = await supabase
      .from('user_stats_detailed')
      .upsert({
        id: userId,
        ...stats,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Record dart throw position for heatmap
  async recordDartPosition(data: {
    user_id: string;
    match_id: string;
    leg_id: string;
    visit_number: number;
    dart_number: number;
    position_x: number;
    position_y: number;
    score: number;
    multiplier: number;
    segment: string;
  }) {
    const { error } = await supabase
      .from('dart_throw_positions')
      .insert(data);

    if (error) throw error;
  }
};

export default statsService;
