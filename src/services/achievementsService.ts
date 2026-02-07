// ============================================
// FIVE01 Darts - Achievements Service
// ============================================

import { supabase } from '@/lib/supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'match' | 'scoring' | 'checkout' | 'training' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement_value: number;
  xp_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string | null;
  progress: number;
  is_unlocked: boolean;
  achievement?: Achievement;
}

export interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  achievements: (UserAchievement & { achievement: Achievement })[];
}

export const tierColors = {
  bronze: 'text-amber-600 bg-amber-600/20 border-amber-600/50',
  silver: 'text-gray-300 bg-gray-300/20 border-gray-300/50',
  gold: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50',
  platinum: 'text-cyan-400 bg-cyan-400/20 border-cyan-400/50',
  diamond: 'text-purple-400 bg-purple-400/20 border-purple-400/50'
};

export const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export const achievementsService = {
  // Get all achievements with user progress
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error || !data) return [];
    return data as UserAchievement[];
  },

  // Get all achievement definitions
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('requirement_value', { ascending: true });

    if (error || !data) return [];
    return data as Achievement[];
  },

  // Update achievement progress
  async updateProgress(userId: string, achievementId: string, progress: number) {
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        progress: progress
      }, {
        onConflict: 'user_id,achievement_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserAchievement;
  },

  // Increment achievement progress
  async incrementProgress(userId: string, achievementId: string, amount: number = 1) {
    // First get current progress
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('progress')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    const currentProgress = existing?.progress || 0;
    
    return this.updateProgress(userId, achievementId, currentProgress + amount);
  },

  // Check if achievement is unlocked
  async isUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('is_unlocked')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (error || !data) return false;
    return data.is_unlocked;
  },

  // Get recently unlocked achievements
  async getRecentUnlocks(userId: string, limit: number = 5): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .eq('is_unlocked', true)
      .order('unlocked_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as UserAchievement[];
  },

  // Get stats summary
  async getAchievementStats(userId: string): Promise<{
    total: number;
    unlocked: number;
    byTier: Record<string, { total: number; unlocked: number }>;
    totalXP: number;
  }> {
    const achievements = await this.getUserAchievements(userId);
    
    const stats = {
      total: achievements.length,
      unlocked: achievements.filter(a => a.is_unlocked).length,
      byTier: {} as Record<string, { total: number; unlocked: number }>,
      totalXP: 0
    };

    achievements.forEach(ua => {
      const tier = ua.achievement?.tier || 'bronze';
      if (!stats.byTier[tier]) {
        stats.byTier[tier] = { total: 0, unlocked: 0 };
      }
      stats.byTier[tier].total++;
      if (ua.is_unlocked) {
        stats.byTier[tier].unlocked++;
        stats.totalXP += ua.achievement?.xp_reward || 0;
      }
    });

    return stats;
  },

  // Helper: Check and update match-related achievements
  async checkMatchAchievements(userId: string, matchData: {
    won: boolean;
    average: number;
    first9Average: number;
    score180s: number;
    score140s: number;
    score100s: number;
    checkout: number;
    isFirstWin: boolean;
  }) {
    const updates = [];

    // First win
    if (matchData.isFirstWin) {
      updates.push(this.updateProgress(userId, 'first_win', 1));
    }

    // Matches played
    updates.push(this.incrementProgress(userId, 'matches_10'));
    updates.push(this.incrementProgress(userId, 'matches_50'));
    updates.push(this.incrementProgress(userId, 'matches_100'));
    updates.push(this.incrementProgress(userId, 'matches_500'));

    // 180s
    if (matchData.score180s > 0) {
      updates.push(this.updateProgress(userId, 'first_180', 1));
      updates.push(this.incrementProgress(userId, 'tons_10', matchData.score180s));
      updates.push(this.incrementProgress(userId, 'tons_100', matchData.score180s));
      updates.push(this.incrementProgress(userId, 'tons_500', matchData.score180s));
    }

    // Average achievements
    if (matchData.average >= 60) updates.push(this.updateProgress(userId, 'average_60', 1));
    if (matchData.average >= 80) updates.push(this.updateProgress(userId, 'average_80', 1));
    if (matchData.average >= 100) updates.push(this.updateProgress(userId, 'average_100', 1));

    // Checkout achievements
    if (matchData.checkout >= 100) {
      updates.push(this.incrementProgress(userId, 'checkouts_10'));
      updates.push(this.incrementProgress(userId, 'checkouts_50'));
      updates.push(this.incrementProgress(userId, 'checkouts_100'));
    }
    if (matchData.checkout >= 100) updates.push(this.updateProgress(userId, 'checkout_100', 1));
    if (matchData.checkout >= 120) updates.push(this.updateProgress(userId, 'checkout_120', 1));
    if (matchData.checkout >= 150) updates.push(this.updateProgress(userId, 'checkout_150', 1));
    if (matchData.checkout >= 170) updates.push(this.updateProgress(userId, 'checkout_170', 1));

    await Promise.all(updates);
  },

  // Initialize achievements for new user
  async initializeUserAchievements(userId: string) {
    const achievements = await this.getAllAchievements();
    
    const inserts = achievements.map(a => ({
      user_id: userId,
      achievement_id: a.id,
      progress: 0,
      is_unlocked: false
    }));

    const { error } = await supabase
      .from('user_achievements')
      .insert(inserts);

    if (error) throw error;
  }
};

export default achievementsService;
