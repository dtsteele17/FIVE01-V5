// ============================================
// FIVE01 Darts - Match History Page
// ============================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { statsService, type MatchHistoryItem } from '@/services/statsService';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Trophy, Target,
  ChevronRight, Gamepad2, Filter
} from 'lucide-react';

export function MatchHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredMatches(matches);
    } else if (filter === 'wins') {
      setFilteredMatches(matches.filter(m => m.winner_id === user?.id));
    } else {
      setFilteredMatches(matches.filter(m => m.winner_id !== user?.id));
    }
  }, [filter, matches, user?.id]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await statsService.getMatchHistory(user!.id, 100);
      setMatches(data);
      setFilteredMatches(data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const getResult = (match: MatchHistoryItem) => {
    if (!match.winner_id) return { text: 'Draw', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    if (match.winner_id === user?.id) return { text: 'Victory', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    return { text: 'Defeat', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getOpponent = (match: MatchHistoryItem) => {
    const isPlayer1 = match.player1_id === user?.id;
    return isPlayer1 ? {
      name: match.player2_display_name || match.player2_username,
      username: match.player2_username,
      legs: match.player2_legs_won,
      myLegs: match.player1_legs_won
    } : {
      name: match.player1_display_name || match.player1_username,
      username: match.player1_username,
      legs: match.player1_legs_won,
      myLegs: match.player2_legs_won
    };
  };

  const stats = {
    total: matches.length,
    wins: matches.filter(m => m.winner_id === user?.id).length,
    losses: matches.filter(m => m.winner_id && m.winner_id !== user?.id).length,
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Navigation currentPage="stats" />
      
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/stats')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Match History</h1>
              <p className="text-gray-400">View your past matches</p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#111827] border-gray-800 p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </Card>
            <Card className="bg-[#111827] border-gray-800 p-4 text-center">
              <p className="text-emerald-400 text-sm mb-1">Wins</p>
              <p className="text-3xl font-bold text-emerald-400">{stats.wins}</p>
            </Card>
            <Card className="bg-[#111827] border-gray-800 p-4 text-center">
              <p className="text-red-400 text-sm mb-1">Losses</p>
              <p className="text-3xl font-bold text-red-400">{stats.losses}</p>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {(['all', 'wins', 'losses'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#111827] text-gray-400 hover:bg-gray-800 border border-gray-800'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Match List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMatches.length === 0 ? (
            <Card className="bg-[#111827] border-gray-800 p-12 text-center">
              <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'all' ? 'No Matches Yet' : `No ${filter}`}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'Start playing to see your match history!' 
                  : `You don't have any ${filter} yet.`}
              </p>
              <Button onClick={() => navigate('/play')} className="bg-emerald-600">
                <Target className="w-4 h-4 mr-2" />
                Play Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => {
                const result = getResult(match);
                const opponent = getOpponent(match);
                const isWin = match.winner_id === user?.id;

                return (
                  <Card 
                    key={match.id} 
                    className="bg-[#111827] border-gray-800 hover:border-gray-700 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Left: Opponent Info */}
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.bg}`}>
                            {isWin ? (
                              <Trophy className={`w-6 h-6 ${result.color}`} />
                            ) : (
                              <span className={`text-2xl ${result.color}`}>✕</span>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">vs</p>
                            <p className="font-semibold text-white">{opponent.name}</p>
                            <p className="text-gray-500 text-xs">@{opponent.username}</p>
                          </div>
                        </div>

                        {/* Center: Score */}
                        <div className="text-center">
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl font-bold ${isWin ? 'text-emerald-400' : 'text-white'}`}>
                              {opponent.myLegs}
                            </span>
                            <span className="text-gray-500">-</span>
                            <span className={`text-2xl font-bold ${!isWin ? 'text-red-400' : 'text-white'}`}>
                              {opponent.legs}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mt-1">
                            Best of {match.legs_to_win * 2 - 1} legs
                          </p>
                        </div>

                        {/* Right: Result & Date */}
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${result.bg} ${result.color}`}>
                            {result.text}
                          </span>
                          <p className="text-gray-400 text-sm mt-2">
                            {formatDate(match.ended_at)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {formatTime(match.ended_at)}
                          </p>
                        </div>
                      </div>

                      {/* Footer: Game Mode & Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {match.game_mode_id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => navigate(`/match-summary/${match.id}`)}
                          >
                            Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Load More (if we add pagination later) */}
          {!loading && filteredMatches.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                Showing {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchHistoryPage;
