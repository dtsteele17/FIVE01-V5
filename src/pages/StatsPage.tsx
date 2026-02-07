import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { statsService } from '@/services/statsService';
import { SupabaseDiagnostics } from '@/components/SupabaseDiagnostics';
import { 
  Target, TrendingUp, Activity, Award,
  Crosshair, Zap, BarChart3, ChevronUp, ChevronDown,
  Trophy, Target as TargetIcon, Calendar, Loader2
} from 'lucide-react';

interface DetailedStats {
  // Averages
  overallAverage: number;
  first9Average: number;
  checkoutPercentage: number;
  
  // Counts
  dartsThrown: number;
  totalMatches: number;
  wins: number;
  losses: number;
  
  // Checkouts
  highestCheckout: number;
  checkoutsMade: number;
  checkoutAttempts: number;
  
  // 180s & High Scores
  tons: number;
  ton40s: number;
  ton80s: number;
  highestScore: number;
  
  // Recent form
  last5Matches: { result: 'win' | 'loss'; score: number; opponent: string }[];
  
  // Scoring distribution
  scoreDistribution: { range: string; count: number }[];
}

export function StatsPage() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('30days');
  const [gameMode, setGameMode] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [detailedStats, setDetailedStats] = useState<DetailedStats>({
    overallAverage: 0,
    first9Average: 0,
    checkoutPercentage: 0,
    dartsThrown: 0,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    highestCheckout: 0,
    checkoutsMade: 0,
    checkoutAttempts: 0,
    tons: 0,
    ton40s: 0,
    ton80s: 0,
    highestScore: 0,
    last5Matches: [],
    scoreDistribution: [
      { range: '0-20', count: 5 },
      { range: '21-40', count: 12 },
      { range: '41-60', count: 28 },
      { range: '61-80', count: 35 },
      { range: '81-100', count: 42 },
      { range: '100+', count: 18 },
    ]
  });

  // Load stats from database
  useEffect(() => {
    if (!user?.id) return;

    const loadStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get detailed stats from database
        const dbStats = await statsService.getUserStats(user.id);
        
        if (dbStats) {
          setDetailedStats(prev => ({
            ...prev,
            overallAverage: dbStats.overall_average || 0,
            checkoutPercentage: dbStats.checkout_percentage || 0,
            dartsThrown: 0,
            totalMatches: dbStats.total_matches || 0,
            wins: dbStats.total_wins || 0,
            losses: dbStats.total_losses || 0,
            highestCheckout: dbStats.highest_checkout || 0,
            tons: dbStats.total_100s || 0,
            ton40s: dbStats.total_140s || 0,
            ton80s: dbStats.total_180s || 0,
            highestScore: dbStats.highest_3_dart || 0,
          }));
        }

        // Get recent matches
        const matches = await statsService.getMatchHistory(user.id, 10);
        setRecentMatches(matches || []);
        
      } catch (err: any) {
        console.error('Error loading stats:', err);
        setError(err.message || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  const winRate = detailedStats.totalMatches > 0 
    ? (detailedStats.wins / detailedStats.totalMatches * 100).toFixed(1)
    : '0.0';

  const StatCard = ({ title, value, subtext, icon: Icon, trend, trendUp }: any) => (
    <Card className="bg-[#111827] border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtext && <p className="text-gray-500 text-sm mt-1">{subtext}</p>}
    </Card>
  );

  const ScoreDistributionChart = () => {
    const maxCount = Math.max(...detailedStats.scoreDistribution.map(d => d.count));
    
    return (
      <div className="space-y-3">
        {detailedStats.scoreDistribution.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-gray-400 text-sm w-16">{item.range}</span>
            <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    );
  };

  // Show diagnostics if there's an error
  if (error && (error.includes('relation') || error.includes('does not exist'))) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navigation currentPage="stats" />
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Database Setup Required</h1>
              <p className="text-gray-400">Your Supabase database needs to be configured.</p>
            </div>
            <SupabaseDiagnostics />
            <div className="mt-8 p-6 bg-[#111827] border border-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Setup Instructions</h3>
              <ol className="space-y-3 text-gray-400 list-decimal list-inside">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Supabase Dashboard</a></li>
                <li>Open the <strong>SQL Editor</strong></li>
                <li>Run the migration files in order:
                  <ul className="ml-6 mt-2 space-y-1 text-sm">
                    <li><code className="bg-gray-800 px-2 py-1 rounded">001_initial_schema.sql</code></li>
                    <li><code className="bg-gray-800 px-2 py-1 rounded">002_rls_policies.sql</code></li>
                    <li><code className="bg-gray-800 px-2 py-1 rounded">003_functions.sql</code></li>
                  </ul>
                </li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="stats" />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
              <p className="text-gray-400">Track your performance and progress over time.</p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-emerald-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading stats...</span>
              </div>
            )}
            <div className="flex gap-3">
              <select 
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Modes</option>
                <option value="301">301</option>
                <option value="501">501</option>
                <option value="ranked">Ranked</option>
                <option value="casual">Casual</option>
              </select>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="py-2 px-4 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Overall Average"
              value={detailedStats.overallAverage > 0 ? detailedStats.overallAverage.toFixed(1) : '—'}
              subtext="Per dart"
              icon={Target}
              trend="2.3%"
              trendUp={true}
            />
            <StatCard 
              title="First 9 Average"
              value={detailedStats.first9Average > 0 ? detailedStats.first9Average.toFixed(1) : '—'}
              subtext="First 3 visits"
              icon={Zap}
              trend="1.8%"
              trendUp={true}
            />
            <StatCard 
              title="Checkout %"
              value={detailedStats.checkoutPercentage > 0 ? `${detailedStats.checkoutPercentage.toFixed(1)}%` : '—'}
              subtext={`${detailedStats.checkoutsMade}/${detailedStats.checkoutAttempts}`}
              icon={Crosshair}
            />
            <StatCard 
              title="Win Rate"
              value={`${winRate}%`}
              subtext={`${detailedStats.wins}W - ${detailedStats.losses}L`}
              icon={Trophy}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#111827] border border-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="scoring" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Scoring
              </TabsTrigger>
              <TabsTrigger value="checkouts" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Checkouts
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Match History
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Score Distribution</h3>
                  </div>
                  <ScoreDistributionChart />
                </Card>

                {/* Recent Form */}
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Recent Form</h3>
                  </div>
                  {detailedStats.last5Matches.length > 0 ? (
                    <div className="space-y-3">
                      {detailedStats.last5Matches.map((match, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${match.result === 'win' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-white">vs {match.opponent}</span>
                          </div>
                          <span className="text-gray-400">{match.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent matches</p>
                      <p className="text-gray-600 text-sm">Play some games to see your form</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#111827] border-gray-800 p-4">
                  <p className="text-gray-400 text-sm mb-1">Darts Thrown</p>
                  <p className="text-2xl font-bold text-white">{detailedStats.dartsThrown}</p>
                </Card>
                <Card className="bg-[#111827] border-gray-800 p-4">
                  <p className="text-gray-400 text-sm mb-1">180s</p>
                  <p className="text-2xl font-bold text-white">{detailedStats.ton80s}</p>
                </Card>
                <Card className="bg-[#111827] border-gray-800 p-4">
                  <p className="text-gray-400 text-sm mb-1">140s</p>
                  <p className="text-2xl font-bold text-white">{detailedStats.ton40s}</p>
                </Card>
                <Card className="bg-[#111827] border-gray-800 p-4">
                  <p className="text-gray-400 text-sm mb-1">100s</p>
                  <p className="text-2xl font-bold text-white">{detailedStats.tons}</p>
                </Card>
              </div>
            </TabsContent>

            {/* Scoring Tab */}
            <TabsContent value="scoring" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Highest Scores</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <span className="text-gray-400">Best Visit</span>
                      <span className="text-2xl font-bold text-yellow-400">
                        {detailedStats.highestScore > 0 ? detailedStats.highestScore : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">180s Scored</span>
                      <span className="text-xl font-bold text-white">{detailedStats.ton80s}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">140+ Scored</span>
                      <span className="text-xl font-bold text-white">{detailedStats.ton40s + detailedStats.ton80s}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">100+ Scored</span>
                      <span className="text-xl font-bold text-white">{detailedStats.tons + detailedStats.ton40s + detailedStats.ton80s}</span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#111827] border-gray-800 p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Average Progression</h3>
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Average progression chart coming soon</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Checkouts Tab */}
            <TabsContent value="checkouts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#111827] border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TargetIcon className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Checkout Stats</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-gray-400 text-sm mb-2">Highest Checkout</p>
                      <p className="text-4xl font-bold text-emerald-400">
                        {detailedStats.highestCheckout > 0 ? detailedStats.highestCheckout : '—'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-white">{detailedStats.checkoutsMade}</p>
                        <p className="text-gray-400 text-sm">Made</p>
                      </div>
                      <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-white">{detailedStats.checkoutAttempts}</p>
                        <p className="text-gray-400 text-sm">Attempts</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                      <p className="text-gray-400 text-sm">Success Rate</p>
                      <p className="text-3xl font-bold text-emerald-400">
                        {detailedStats.checkoutPercentage > 0 ? `${detailedStats.checkoutPercentage.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#111827] border-gray-800 p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Crosshair className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Checkout History</h3>
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">Checkout history visualization coming soon</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Match History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card className="bg-[#111827] border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Recent Matches</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Opponent</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Mode</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Result</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMatches.length > 0 ? (
                        recentMatches.map((match, i) => (
                          <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-3 px-4 text-gray-300">
                              {match.played_at ? new Date(match.played_at).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3 px-4 text-white">
                              {match.opponent_display_name || match.opponent_username || 'Unknown'}
                            </td>
                            <td className="py-3 px-4 text-gray-400">
                              {match.game_mode || '501'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                match.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                                match.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {match.result?.toUpperCase() || '—'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-300">
                              {match.player_score} - {match.opponent_score}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                            {loading ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading matches...
                              </div>
                            ) : (
                              'No match history available yet'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
