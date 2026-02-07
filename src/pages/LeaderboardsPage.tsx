// ============================================
// FIVE01 Darts - Leaderboards Page
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { statsService, type LeaderboardEntry } from '@/services/statsService';
import { useFriendsStore } from '@/store/friendsStore';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Target, Flame, TrendingUp, Crown, 
  ArrowLeft, Users, Globe, Medal
} from 'lucide-react';

type Category = 'elo' | 'wins' | 'average' | 'checkouts' | '180s';

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'elo', label: 'ELO Rating', icon: <Trophy className="w-4 h-4" /> },
  { id: 'wins', label: 'Total Wins', icon: <Crown className="w-4 h-4" /> },
  { id: 'average', label: '3-Dart Average', icon: <Target className="w-4 h-4" /> },
  { id: '180s', label: '180s Scored', icon: <Flame className="w-4 h-4" /> },
  { id: 'checkouts', label: 'Checkouts', icon: <TrendingUp className="w-4 h-4" /> },
];

const tierColors: Record<number, string> = {
  1: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50',
  2: 'text-gray-300 bg-gray-300/20 border-gray-300/50',
  3: 'text-amber-600 bg-amber-600/20 border-amber-600/50',
};

export function LeaderboardsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { friends } = useFriendsStore();
  
  const [activeCategory, setActiveCategory] = useState<Category>('elo');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(0);

  useEffect(() => {
    loadLeaderboards();
  }, [activeCategory]);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      const [global, rank] = await Promise.all([
        statsService.getLeaderboard(activeCategory, 100),
        user ? statsService.getUserRank(user.id, activeCategory) : 0
      ]);
      
      setGlobalLeaderboard(global);
      setUserRank(rank);

      // Filter friends leaderboard
      const friendIds = new Set(friends.map(f => f.id));
      friendIds.add(user?.id || ''); // Include current user
      
      const friendsData = global.filter(entry => friendIds.has(entry.user_id));
      // Re-rank friends
      const rankedFriends = friendsData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      setFriendsLeaderboard(rankedFriends);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number, category: Category): string => {
    switch (category) {
      case 'elo':
        return Math.round(value).toString();
      case 'average':
      case 'checkouts':
        return value.toFixed(1);
      default:
        return Math.round(value).toLocaleString();
    }
  };

  const getValueLabel = (category: Category): string => {
    switch (category) {
      case 'elo': return 'ELO';
      case 'average': return 'Avg';
      case 'checkouts': return 'Total';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="leaderboard" />
      
      <div className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Leaderboards</h1>
              <p className="text-gray-400">See how you rank against others</p>
            </div>
          </div>

          {/* Category Selector */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#111827] text-gray-400 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {cat.icon}
                <span className="hidden md:inline">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* User's Rank Card */}
          {userRank > 0 && (
            <Card className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 border-emerald-500/30 p-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-400">#{userRank}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-400">Your Global Rank</p>
                  <p className="text-xl font-bold text-white">{categories.find(c => c.id === activeCategory)?.label}</p>
                </div>
                <Button 
                  onClick={() => navigate('/stats')}
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-400"
                >
                  View Stats
                </Button>
              </div>
            </Card>
          )}

          {/* Leaderboards Tabs */}
          <Tabs defaultValue="global" className="space-y-6">
            <TabsList className="bg-[#111827] border border-gray-800">
              <TabsTrigger value="global" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Globe className="w-4 h-4 mr-2" />
                Global
              </TabsTrigger>
              <TabsTrigger value="friends" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </TabsTrigger>
            </TabsList>

            {/* Global Leaderboard */}
            <TabsContent value="global">
              <LeaderboardTable 
                entries={globalLeaderboard}
                category={activeCategory}
                formatValue={formatValue}
                getValueLabel={getValueLabel}
                currentUserId={user?.id}
                loading={loading}
              />
            </TabsContent>

            {/* Friends Leaderboard */}
            <TabsContent value="friends">
              {friends.length === 0 ? (
                <Card className="bg-[#111827] border-gray-800 p-12 text-center">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Friends Yet</h3>
                  <p className="text-gray-400 mb-6">Add friends to see how you compare!</p>
                  <Button onClick={() => navigate('/friends')} className="bg-emerald-600">
                    <Users className="w-4 h-4 mr-2" />
                    Find Friends
                  </Button>
                </Card>
              ) : (
                <LeaderboardTable 
                  entries={friendsLeaderboard}
                  category={activeCategory}
                  formatValue={formatValue}
                  getValueLabel={getValueLabel}
                  currentUserId={user?.id}
                  loading={loading}
                  isFriends
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Table Component
interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  category: Category;
  formatValue: (value: number, category: Category) => string;
  getValueLabel: (category: Category) => string;
  currentUserId?: string;
  loading: boolean;
  isFriends?: boolean;
}

function LeaderboardTable({ 
  entries, 
  category, 
  formatValue, 
  getValueLabel,
  currentUserId,
  loading,
  isFriends 
}: LeaderboardTableProps) {
  if (loading) {
    return (
      <Card className="bg-[#111827] border-gray-800 p-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="bg-[#111827] border-gray-800 p-12 text-center">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No data available yet</p>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111827] border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 text-sm font-medium text-gray-400">
        <div className="col-span-2 md:col-span-1">Rank</div>
        <div className="col-span-7 md:col-span-9">Player</div>
        <div className="col-span-3 text-right">{getValueLabel(category)}</div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-800">
        {entries.map((entry) => {
          const isCurrentUser = entry.user_id === currentUserId;
          const rankStyle = entry.rank <= 3 ? tierColors[entry.rank] : '';
          
          return (
            <div 
              key={entry.user_id}
              className={`grid grid-cols-12 gap-4 p-4 items-center ${
                isCurrentUser ? 'bg-emerald-500/10' : 'hover:bg-gray-800/50'
              } transition-colors`}
            >
              {/* Rank */}
              <div className="col-span-2 md:col-span-1">
                {entry.rank <= 3 ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${rankStyle}`}>
                    <Medal className="w-4 h-4" />
                  </div>
                ) : (
                  <span className="text-gray-400 font-medium">#{entry.rank}</span>
                )}
              </div>

              {/* Player */}
              <div className="col-span-7 md:col-span-9 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold">
                  {entry.display_name?.[0] || entry.username?.[0] || '?'}
                </div>
                <div>
                  <p className={`font-medium ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                    {entry.display_name || entry.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-sm">@{entry.username}</p>
                </div>
              </div>

              {/* Value */}
              <div className="col-span-3 text-right">
                <span className="text-xl font-bold text-white">
                  {formatValue(entry.value, category)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Footer */}
      {!isFriends && entries.length >= 100 && (
        <div className="p-4 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">Showing top 100 players</p>
        </div>
      )}
    </Card>
  );
}

export default LeaderboardsPage;
