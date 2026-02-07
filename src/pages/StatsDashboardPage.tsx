// ============================================
// FIVE01 Darts - Statistics Dashboard
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { statsService, type UserStatsDetailed, type ProgressData } from '@/services/statsService';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, TrendingUp, Trophy, Flame, Award, 
  ArrowLeft, BarChart3, Crown, Zap, Calendar
} from 'lucide-react';

export function StatsDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStatsDetailed | null>(null);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, progressData, userRank] = await Promise.all([
        statsService.getUserStats(user!.id),
        statsService.getProgressData(user!.id),
        statsService.getUserRank(user!.id, 'elo')
      ]);
      
      setStats(statsData);
      setProgress(progressData);
      setRank(userRank);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num?.toLocaleString() || '0';
  };

  const formatAverage = (avg: number) => {
    return avg?.toFixed(1) || '0.0';
  };

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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Statistics</h1>
              <p className="text-gray-400">Track your performance and progress</p>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#111827] border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Global Rank</p>
                  <p className="text-2xl font-bold text-white">#{rank || '-'}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-[#111827] border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">3-Dart Avg</p>
                  <p className="text-2xl font-bold text-white">{formatAverage(stats?.overall_average || 0)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-[#111827] border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">180s</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(stats?.total_180s || 0)}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-[#111827] border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Win Rate</p>
                  <p className="text-2xl font-bold text-white">{formatAverage(stats?.win_rate || 0)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#111827] border border-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="scoring" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Scoring
              </TabsTrigger>
              <TabsTrigger value="checkouts" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Checkouts
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Award className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Match Stats */}
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    Match Statistics
                  </h3>
                  <div className="space-y-4">
                    <StatRow label="Total Matches" value={formatNumber(stats?.total_matches || 0)} />
                    <StatRow label="Wins" value={formatNumber(stats?.total_wins || 0)} color="text-emerald-400" />
                    <StatRow label="Losses" value={formatNumber(stats?.total_losses || 0)} color="text-red-400" />
                    <StatRow label="Win Rate" value={`${formatAverage(stats?.win_rate || 0)}%`} />
                    <div className="pt-4 border-t border-gray-800">
                      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(stats?.win_rate || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Average Stats */}
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Averages
                  </h3>
                  <div className="space-y-4">
                    <StatRow label="Overall 3-Dart Average" value={formatAverage(stats?.overall_average || 0)} />
                    <StatRow label="First 9 Darts Average" value={formatAverage(stats?.first_9_average || 0)} />
                    <StatRow label="Highest 3-Dart Score" value={formatNumber(stats?.highest_3_dart || 0)} />
                  </div>
                </Card>
              </div>

              {/* Progress Chart */}
              <Card className="bg-[#111827] border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  30-Day Progress
                </h3>
                {progress.length > 0 ? (
                  <div className="space-y-3">
                    {progress.slice(-7).map((day) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm w-24">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                          <div 
                            className="h-full bg-emerald-500/50 rounded-lg flex items-center px-3"
                            style={{ width: `${Math.min((day.average / 100) * 100, 100)}%` }}
                          >
                            <span className="text-white text-sm font-medium">
                              {day.average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm w-16 text-right">
                          {day.matches} {day.matches === 1 ? 'game' : 'games'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No matches played in the last 30 days
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Scoring Tab */}
            <TabsContent value="scoring" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BigNumberCard 
                  icon={<Flame className="w-8 h-8 text-orange-400" />}
                  label="180s"
                  value={stats?.total_180s || 0}
                  subtext="Maximum scores"
                />
                <BigNumberCard 
                  icon={<Target className="w-8 h-8 text-yellow-400" />}
                  label="140s+"
                  value={stats?.total_140s || 0}
                  subtext="Scores 140-179"
                />
                <BigNumberCard 
                  icon={<Zap className="w-8 h-8 text-blue-400" />}
                  label="100s+"
                  value={stats?.total_100s || 0}
                  subtext="Ton+ scores"
                />
              </div>

              <Card className="bg-[#111827] border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Scoring Breakdown</h3>
                <div className="space-y-4">
                  <ProgressBar 
                    label="180s (Max)" 
                    value={stats?.total_180s || 0} 
                    max={Math.max(stats?.total_ton_plus || 1, 1)}
                    color="bg-orange-500"
                  />
                  <ProgressBar 
                    label="140-179" 
                    value={stats?.total_140s || 0} 
                    max={Math.max(stats?.total_ton_plus || 1, 1)}
                    color="bg-yellow-500"
                  />
                  <ProgressBar 
                    label="100-139" 
                    value={(stats?.total_100s || 0) - (stats?.total_140s || 0)} 
                    max={Math.max(stats?.total_ton_plus || 1, 1)}
                    color="bg-blue-500"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Checkouts Tab */}
            <TabsContent value="checkouts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Checkout Statistics</h3>
                  <div className="space-y-4">
                    <StatRow label="Highest Checkout" value={stats?.highest_checkout || 0} />
                    <StatRow label="Total Checkouts" value={stats?.total_checkouts || 0} />
                    <StatRow label="Checkout %" value={`${formatAverage(stats?.checkout_percentage || 0)}%`} />
                  </div>
                </Card>

                <Card className="bg-[#111827] border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Checkout Milestones</h3>
                  <div className="space-y-3">
                    <MilestoneItem achieved={(stats?.highest_checkout || 0) >= 100} label="100+ Checkout" />
                    <MilestoneItem achieved={(stats?.highest_checkout || 0) >= 120} label="120+ Checkout" />
                    <MilestoneItem achieved={(stats?.highest_checkout || 0) >= 150} label="150+ Checkout" />
                    <MilestoneItem achieved={(stats?.highest_checkout || 0) >= 170} label="170 Checkout" />
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Training Records</h3>
                  <div className="space-y-4">
                    <StatRow 
                      label="Finish Training Completed" 
                      value={`${stats?.finish_training_completed || 0}/169`}
                    />
                    <StatRow 
                      label="Around the Clock Best" 
                      value={stats?.around_clock_best_darts ? `${stats.around_clock_best_darts} darts` : '-'}
                    />
                    <StatRow 
                      label="JDC Challenge Best" 
                      value={stats?.jdc_best_score || 0}
                    />
                    <StatRow 
                      label="Bob's 27 Best" 
                      value={stats?.bobs27_best_score || 0}
                    />
                  </div>
                </Card>

                <Card className="bg-[#111827] border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/training')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Start Training
                    </Button>
                    <Button 
                      onClick={() => navigate('/training/finish')}
                      variant="outline"
                      className="w-full border-gray-600"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Practice Checkouts
                    </Button>
                    <Button 
                      onClick={() => navigate('/training/jdc-challenge')}
                      variant="outline"
                      className="w-full border-gray-600"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      JDC Challenge
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Button onClick={() => navigate('/match-history')} className="bg-emerald-600 hover:bg-emerald-700">
              <Calendar className="w-4 h-4 mr-2" />
              View Match History
            </Button>
            <Button onClick={() => navigate('/achievements')} variant="outline" className="border-gray-600">
              <Award className="w-4 h-4 mr-2" />
              View Achievements
            </Button>
            <Button onClick={() => navigate('/leaderboard')} variant="outline" className="border-gray-600">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboards
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`text-xl font-bold ${color || 'text-white'}`}>{value}</span>
    </div>
  );
}

function BigNumberCard({ icon, label, value, subtext }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
  subtext: string;
}) {
  return (
    <Card className="bg-[#111827] border-gray-800 p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-4xl font-bold text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-gray-300 font-medium">{label}</p>
      <p className="text-gray-500 text-sm">{subtext}</p>
    </Card>
  );
}

function ProgressBar({ label, value, max, color }: { 
  label: string; 
  value: number; 
  max: number;
  color: string;
}) {
  const percentage = Math.max(0, Math.min((value / max) * 100, 100));
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-sm">{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MilestoneItem({ achieved, label }: { achieved: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      achieved ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-gray-800/50'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
        achieved ? 'bg-emerald-500' : 'bg-gray-700'
      }`}>
        {achieved ? (
          <Trophy className="w-4 h-4 text-white" />
        ) : (
          <span className="text-gray-500 text-xs">🔒</span>
        )}
      </div>
      <span className={achieved ? 'text-emerald-400' : 'text-gray-500'}>{label}</span>
    </div>
  );
}

export default StatsDashboardPage;
