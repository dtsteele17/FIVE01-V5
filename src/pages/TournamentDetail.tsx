import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService, type Tournament, type TournamentParticipant, type TournamentMatch } from '@/services/tournamentService';
import { useAuthStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, CheckCircle, Crown, ArrowLeft, Play, Medal } from 'lucide-react';


export const TournamentDetail = function TournamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [bracket, setBracket] = useState<TournamentMatch[]>([]);
  const [myMatch, setMyMatch] = useState<TournamentMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (id) {
      loadTournament();
      const subscription = tournamentService.subscribeToTournament(id, () => {
        loadTournament();
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  const loadTournament = async () => {
    try {
      setLoading(true);
      
      // Get tournament data
      const { data: tournamentData } = await tournamentService.getTournament(id!);
      setTournament(tournamentData);

      // Get participants
      const { data: participantsData } = await tournamentService.getParticipants(id!);
      setParticipants(participantsData || []);

      // Get matches/bracket
      const { data: matchesData } = await tournamentService.getMatches(id!);
      setBracket(matchesData || []);

      // Check if user is joined
      if (participantsData && user) {
        const myParticipation = participantsData.find((p: any) => p.player_id === user.id);
        setIsJoined(!!myParticipation);
        setIsCheckedIn(myParticipation?.status === 'checked_in');
      }
      
      if (tournamentData) {
        setIsCreator(tournamentData.created_by === user?.id);
      }

      // Get my current match if tournament is active
      if (tournamentData?.status === 'active' && matchesData) {
        const myCurrentMatch = matchesData.find((m: any) => 
          (m.player1_id === user?.id || m.player2_id === user?.id) && 
          m.status !== 'completed'
        );
        setMyMatch(myCurrentMatch || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!id || !user) return;
    const { data } = await tournamentService.joinTournament(id);
    if (data) {
      setIsJoined(true);
      loadTournament();
    }
  };

  const handleLeave = async () => {
    if (!id || !user) return;
    const { error } = await tournamentService.leaveTournament(id);
    if (!error) {
      setIsJoined(false);
      loadTournament();
    }
  };

  const handleCheckIn = async () => {
    if (!id) return;
    const { data } = await tournamentService.checkIn(id);
    if (data) {
      setIsCheckedIn(true);
      loadTournament();
    }
  };

  const handleStart = async () => {
    if (!id) return;
    const { data } = await tournamentService.startTournament(id);
    if (data) {
      loadTournament();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      registering: 'bg-emerald-500/20 text-emerald-400',
      registration_open: 'bg-emerald-500/20 text-emerald-400',
      registration_closed: 'bg-yellow-500/20 text-yellow-400',
      active: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-purple-500/20 text-purple-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return styles[status] || styles.draft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-white">Loading tournament...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-white">Tournament not found</div>
      </div>
    );
  }

  const isRegistrationOpen = tournament.status === 'registering';
  const canJoin = isRegistrationOpen && !isJoined;
  const canLeave = isRegistrationOpen && isJoined && !isCheckedIn;
  const canCheckIn = isRegistrationOpen && isJoined && !isCheckedIn;
  const canStart = isCreator && tournament.status === 'registering';

  return (
    <div className="min-h-screen bg-[#0a0f1a] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/tournaments')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBadge(tournament.status)}`}>
                {tournament.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {canJoin && (
              <Button onClick={handleJoin} className="bg-emerald-600 hover:bg-emerald-700">
                <Users className="w-4 h-4 mr-2" />
                Join Tournament
              </Button>
            )}
            {canLeave && (
              <Button variant="destructive" onClick={handleLeave}>
                Leave Tournament
              </Button>
            )}
            {canCheckIn && (
              <Button onClick={handleCheckIn} variant="outline" className="border-yellow-500 text-yellow-500">
                <CheckCircle className="w-4 h-4 mr-2" />
                Check In
              </Button>
            )}
            {canStart && (
              <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Start Tournament
              </Button>
            )}
          </div>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Prize Pool</p>
                <p className="text-lg font-bold text-white">${tournament.prize_pool || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Format</p>
                <p className="text-lg font-bold text-white">{tournament.max_participants} Players</p>
              </div>
            </div>
          </Card>
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Medal className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Game Mode</p>
                <p className="text-lg font-bold text-white">{tournament.game_mode || '501'}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm text-gray-400">Rounds</p>
                <p className="text-lg font-bold text-white">{tournament.total_rounds} Rounds</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Match Alert */}
        {myMatch && myMatch.status !== 'completed' && (
          <Card className="bg-blue-900/20 border-blue-500/50 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Match is Ready!</h3>
                <p className="text-gray-400">Round {myMatch.round}: vs {(myMatch as any).player2_name || 'TBD'}</p>
              </div>
              <Button onClick={() => navigate(`/game/${(myMatch as any).match_id || myMatch.id}`)} className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Play Match
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="bracket" className="space-y-6">
          <TabsList className="bg-[#111827] border border-gray-800">
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
            <TabsTrigger value="participants">Participants ({participants.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bracket">
            <Card className="bg-[#111827] border-gray-800 p-6">
              {bracket.length > 0 ? (
                <TournamentBracket bracket={bracket} />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Bracket will be generated when the tournament starts
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="participants">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((p: any) => (
                <Card key={p.player_id || p.id} className="bg-[#111827] border-gray-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-400">
                      {((p.player_name || p.player?.display_name || p.player?.username || '??')[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{p.player_name || p.player?.display_name || p.player?.username || 'Unknown'}</p>
                      <span className={`text-xs ${
                        p.status === 'checked_in' ? 'text-emerald-400' :
                        p.status === 'registered' ? 'text-blue-400' :
                        p.status === 'eliminated' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {(p.status || 'unknown').replace('_', ' ')}
                      </span>
                    </div>
                    {p.final_position && p.final_position <= 3 && (
                      <Medal className={`w-5 h-5 ${
                        p.final_position === 1 ? 'text-yellow-400' :
                        p.final_position === 2 ? 'text-gray-400' :
                        'text-amber-600'
                      }`} />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Tournament Bracket Component
function TournamentBracket({ bracket }: { bracket: TournamentMatch[] }) {
  // Group matches by round
  const rounds = bracket.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, TournamentMatch[]>);

  const maxRound = Math.max(...Object.keys(rounds).map(Number));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {Object.entries(rounds).map(([roundNum, matches]) => (
          <div key={roundNum} className="flex flex-col gap-4">
            <h3 className="text-center font-bold text-gray-400 mb-2">
              {(matches[0] as any)?.round_name || `Round ${roundNum}`}
            </h3>
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} isFinal={Number(roundNum) === maxRound} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Individual Match Card
const MatchCard = function MatchCard({ match, isFinal }: { match: TournamentMatch; isFinal?: boolean }) {
  const getStatusColor = () => {
    switch (match.status) {
      case 'completed': return 'border-emerald-500/50';
      case 'active': return 'border-blue-500/50';
      case 'pending': return 'border-yellow-500/50';
      default: return 'border-gray-700';
    }
  };

  const player1Name = (match as any).player1_name || match.player1?.display_name || match.player1?.username || 'TBD';
  const player2Name = (match as any).player2_name || match.player2?.display_name || match.player2?.username || 'TBD';

  return (
    <div className={`w-48 bg-[#1a1f2e] rounded-lg border-2 ${getStatusColor()} overflow-hidden ${isFinal ? 'ring-2 ring-yellow-500/50' : ''}`}>
      {/* Player 1 */}
      <div className={`p-3 border-b border-gray-800 ${match.winner_id === match.player1_id ? 'bg-emerald-900/20' : ''}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${match.winner_id === match.player1_id ? 'font-bold text-white' : 'text-gray-300'}`}>
            {player1Name}
          </span>
          {match.winner_id === match.player1_id && <Crown className="w-4 h-4 text-yellow-400" />}
        </div>
        {(match as any).player1_score > 0 && (
          <span className="text-xs text-gray-500">{(match as any).player1_score} legs</span>
        )}
      </div>

      {/* Player 2 */}
      <div className={`p-3 ${match.winner_id === match.player2_id ? 'bg-emerald-900/20' : ''}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate ${match.winner_id === match.player2_id ? 'font-bold text-white' : 'text-gray-300'}`}>
            {player2Name}
          </span>
          {match.winner_id === match.player2_id && <Crown className="w-4 h-4 text-yellow-400" />}
        </div>
        {(match as any).player2_score > 0 && (
          <span className="text-xs text-gray-500">{(match as any).player2_score} legs</span>
        )}
      </div>

      {/* Status */}
      <div className="px-3 py-1 bg-gray-900 text-center">
        <span className={`text-xs capitalize ${
          match.status === 'active' ? 'text-blue-400' :
          match.status === 'completed' ? 'text-emerald-400' :
          'text-gray-500'
        }`}>
          {(match.status || 'pending').replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};
