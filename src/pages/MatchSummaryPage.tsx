import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Home, User, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';

interface MatchStats {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string;
  player1_score: number;
  player2_score: number;
  game_mode: string;
  created_at: string;
  player1?: { display_name: string; username: string };
  player2?: { display_name: string; username: string };
}

export function MatchSummaryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [match, setMatch] = useState<MatchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchSummary();
  }, [id]);

  const fetchMatchSummary = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(display_name, username),
        player2:player2_id(display_name, username)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching match:', error);
    } else {
      setMatch(data);
    }
    setLoading(false);
  };

  const handleRematch = () => {
    navigate('/play');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Match not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isWinner = match.winner_id === user?.id;
  const player1Name = match.player1?.display_name || match.player1?.username || 'Player 1';
  const player2Name = match.player2?.display_name || match.player2?.username || 'Player 2';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Winner Banner */}
        <div className={`text-center mb-8 p-8 rounded-2xl ${
          isWinner 
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
            : 'bg-slate-900 border border-slate-800'
        }`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isWinner ? 'bg-yellow-500' : 'bg-slate-700'
          }`}>
            <Award className={`w-10 h-10 ${isWinner ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isWinner ? 'You Won!' : 'Match Complete'}
          </h1>
          <p className="text-slate-400">
            {match.game_mode} • Best of {match.player1_score + match.player2_score}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8">
          <div className="flex items-center justify-center gap-8">
            {/* Player 1 */}
            <div className={`text-center ${match.winner_id === match.player1_id ? 'scale-110' : ''}`}>
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                match.winner_id === match.player1_id ? 'bg-yellow-500/20' : 'bg-slate-800'
              }`}>
                <User className={`w-8 h-8 ${
                  match.winner_id === match.player1_id ? 'text-yellow-400' : 'text-slate-400'
                }`} />
              </div>
              <p className={`font-semibold ${
                match.winner_id === match.player1_id ? 'text-yellow-400' : 'text-white'
              }`}>
                {player1Name}
              </p>
              <p className="text-3xl font-bold text-white mt-2">{match.player1_score}</p>
              {match.winner_id === match.player1_id && (
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                  Winner
                </span>
              )}
            </div>

            {/* VS */}
            <div className="text-slate-600 font-bold text-xl">VS</div>

            {/* Player 2 */}
            <div className={`text-center ${match.winner_id === match.player2_id ? 'scale-110' : ''}`}>
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                match.winner_id === match.player2_id ? 'bg-yellow-500/20' : 'bg-slate-800'
              }`}>
                <User className={`w-8 h-8 ${
                  match.winner_id === match.player2_id ? 'text-yellow-400' : 'text-slate-400'
                }`} />
              </div>
              <p className={`font-semibold ${
                match.winner_id === match.player2_id ? 'text-yellow-400' : 'text-white'
              }`}>
                {player2Name}
              </p>
              <p className="text-3xl font-bold text-white mt-2">{match.player2_score}</p>
              {match.winner_id === match.player2_id && (
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                  Winner
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRematch}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Rematch
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchSummaryPage;
