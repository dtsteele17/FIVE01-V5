// ============================================
// FIVE01 Darts - Achievements Page
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { 
  achievementsService, 
  type UserAchievement,
  tierColors,
  tierOrder 
} from '@/services/achievementsService';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  ArrowLeft, Trophy, Target, Flame, Zap, Users, Award, Star,
  Lock, CheckCircle2
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  match: <Trophy className="w-5 h-5" />,
  scoring: <Target className="w-5 h-5" />,
  checkout: <Zap className="w-5 h-5" />,
  training: <Flame className="w-5 h-5" />,
  social: <Users className="w-5 h-5" />,
  special: <Star className="w-5 h-5" />,
};

const categoryLabels: Record<string, string> = {
  match: 'Matches',
  scoring: 'Scoring',
  checkout: 'Checkouts',
  training: 'Training',
  social: 'Social',
  special: 'Special',
};

export function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unlocked: 0,
    byTier: {} as Record<string, { total: number; unlocked: number }>,
    totalXP: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [userAchievements, achievementStats] = await Promise.all([
        achievementsService.getUserAchievements(user!.id),
        achievementsService.getAchievementStats(user!.id)
      ]);
      setAchievements(userAchievements);
      setStats(achievementStats);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const getCategoryAchievements = (category: string) => {
    return achievements.filter(a => a.achievement?.category === category);
  };

  const getTierProgress = (tier: string) => {
    const tierStats = stats.byTier[tier];
    if (!tierStats) return { unlocked: 0, total: 0, percent: 0 };
    return {
      unlocked: tierStats.unlocked,
      total: tierStats.total,
      percent: tierStats.total > 0 ? (tierStats.unlocked / tierStats.total) * 100 : 0
    };
  };

  const completionPercent = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navigation currentPage="stats" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="stats" />
      
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/stats')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Achievements</h1>
              <p className="text-gray-400">Collect badges and earn XP</p>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="bg-[#111827] border-gray-800 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Progress */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
                  <span className="text-emerald-400 font-bold">
                    {stats.unlocked}/{stats.total}
                  </span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {completionPercent.toFixed(0)}% complete • {stats.totalXP.toLocaleString()} XP earned
                </p>
              </div>

              {/* Tier Breakdown */}
              <div className="space-y-2">
                {tierOrder.map((tier) => {
                  const progress = getTierProgress(tier);
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <span className={`capitalize text-sm ${tierColors[tier as keyof typeof tierColors]?.split(' ')[0] || 'text-gray-400'}`}>
                        {tier}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {progress.unlocked}/{progress.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Category Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-[#111827] border border-gray-800 flex-wrap h-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Award className="w-4 h-4 mr-2" />
                All
              </TabsTrigger>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                >
                  {categoryIcons[key]}
                  <span className="ml-2 hidden md:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* All Achievements */}
            <TabsContent value="all">
              <AchievementGrid 
                achievements={achievements}
              />
            </TabsContent>

            {/* Category Tabs */}
            {Object.keys(categoryLabels).map((category) => (
              <TabsContent key={category} value={category}>
                <AchievementGrid 
                  achievements={getCategoryAchievements(category)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Achievement Grid Component
interface AchievementGridProps {
  achievements: UserAchievement[];
}

function AchievementGrid({ achievements }: AchievementGridProps) {
  if (achievements.length === 0) {
    return (
      <Card className="bg-[#111827] border-gray-800 p-12 text-center">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No achievements in this category</p>
      </Card>
    );
  }

  // Sort: unlocked first, then by progress
  const sorted = [...achievements].sort((a, b) => {
    if (a.is_unlocked && !b.is_unlocked) return -1;
    if (!a.is_unlocked && b.is_unlocked) return 1;
    return (b.progress / (b.achievement?.requirement_value || 1)) - 
           (a.progress / (a.achievement?.requirement_value || 1));
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((ua) => {
        const achievement = ua.achievement;
        if (!achievement) return null;

        const progressPercent = Math.min(
          (ua.progress / achievement.requirement_value) * 100,
          100
        );
        const isUnlocked = ua.is_unlocked;
        const tierClass = tierColors[achievement.tier];

        return (
          <Card 
            key={ua.id}
            className={`relative overflow-hidden transition-all ${
              isUnlocked 
                ? 'bg-[#111827] border-gray-800' 
                : 'bg-gray-900/50 border-gray-800/50 opacity-75'
            }`}
          >
            {/* Tier Badge */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold uppercase ${tierClass}`}>
              {achievement.tier}
            </div>

            <div className="p-5">
              {/* Icon & Category */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isUnlocked ? tierClass : 'bg-gray-800 text-gray-500'
                }`}>
                  {categoryIcons[achievement.category]}
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    {categoryLabels[achievement.category]}
                  </p>
                  <h3 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4">
                {achievement.description}
              </p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {isUnlocked ? 'Completed!' : `${ua.progress}/${achievement.requirement_value}`}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    +{achievement.xp_reward} XP
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isUnlocked ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Unlocked Date */}
              {isUnlocked && ua.unlocked_at && (
                <p className="text-gray-500 text-xs mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Unlocked {new Date(ua.unlocked_at).toLocaleDateString()}
                </p>
              )}

              {/* Locked Indicator */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default AchievementsPage;
