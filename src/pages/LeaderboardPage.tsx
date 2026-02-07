import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  username: string;
  matches_played: number;
  matches_won: number;
  win_rate: number;
  average_score: number;
}

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        matches_played,
        matches_won,
        average_score
      `)
      .order('matches_won', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      const formatted = data?.map((player, index) => ({
        rank: index + 1,
        user_id: player.id,
        display_name: player.display_name || player.username,
        username: player.username,
        matches_played: player.matches_played || 0,
        matches_won: player.matches_won || 0,
        win_rate: player.matches_played > 0 
          ? Math.round((player.matches_won / player.matches_played) * 100) 
          : 0,
        average_score: player.average_score || 0,
      })) || [];
      setLeaderboard(formatted);
    }
    setLoading(false);
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 2:
        return 'bg-slate-400/20 text-slate-300 border-slate-400/30';
      case 3:
        return 'bg-amber-600/20 text-amber-400 border-amber-600/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-400" />;
      default:
        return <span className="w-5 text-center text-slate-500 font-bold">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                  <p className="text-sm text-slate-400">Global rankings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-400/20 flex items-center justify-center">
                <Medal className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 mb-1">2nd Place</p>
              <p className="font-bold text-white truncate">{leaderboard[1].display_name}</p>
              <p className="text-2xl font-bold text-slate-300 mt-2">{leaderboard[1].matches_won} W</p>
            </div>

            {/* 1st Place */}
            <div className="bg-gradient-to-b from-yellow-500/20 to-slate-900 rounded-2xl border border-yellow-500/30 p-6 text-center transform -translate-y-4">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-yellow-500/30 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-yellow-400" />
              </div>
              <p className="text-sm text-yellow-400 mb-1">1st Place</p>
              <p className="font-bold text-white text-lg truncate">{leaderboard[0].display_name}</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{leaderboard[0].matches_won} W</p>
            </div>

            {/* 3rd Place */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-600/20 flex items-center justify-center">
                <Medal className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-sm text-slate-400 mb-1">3rd Place</p>
              <p className="font-bold text-white truncate">{leaderboard[2].display_name}</p>
              <p className="text-2xl font-bold text-amber-400 mt-2">{leaderboard[2].matches_won} W</p>
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Global Rankings</h2>
          </div>
          
          <div className="divide-y divide-slate-800">
            {leaderboard.map((player) => (
              <div
                key={player.user_id}
                className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getRankStyle(player.rank)}`}>
                  {getRankIcon(player.rank)}
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{player.display_name}</p>
                  <p className="text-sm text-slate-500">@{player.username}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white">{player.matches_won}W</p>
                  <p className="text-xs text-slate-500">{player.win_rate}% WR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;
