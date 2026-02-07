import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService, type Tournament } from '@/services/tournamentService';
import { useAuthStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Users, Clock, ChevronRight, 
  Plus, Crown, Medal, Timer
} from 'lucide-react';

export function TournamentBrowser() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const { data: tournamentsData } = await tournamentService.getTournaments();
      
      // Separate into open, active, completed
      const all = tournamentsData || [];
      setTournaments(all);
      
      // Get my tournaments
      const mine = all.filter((t: any) => 
        // Created by me or I'm participating
        t.created_by === user?.id
      );
      setMyTournaments(mine);
    } catch {
      // Silent fail - tournaments will retry on refresh
    } finally {
      setLoading(false);
    }
  };

  const openTournaments = tournaments.filter(t => t.status === 'registering');
  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  const getRoundName = (totalRounds: number, currentRound: number) => {
    const roundsFromEnd = totalRounds - currentRound + 1;
    switch (roundsFromEnd) {
      case 1: return 'Final';
      case 2: return 'Semi Finals';
      case 3: return 'Quarter Finals';
      case 4: return 'Round of 16';
      case 5: return 'Round of 32';
      case 6: return 'Round of 64';
      case 7: return 'Round of 128';
      default: return `Round ${currentRound}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tournaments</h1>
              <p className="text-gray-400">Compete in brackets up to 128 players</p>
            </div>
            <Button
              onClick={() => navigate('/tournaments/create')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Tournament
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Open Tournaments</p>
                <p className="text-2xl font-bold text-white">{openTournaments.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Timer className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Active Now</p>
                <p className="text-2xl font-bold text-white">{activeTournaments.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Completed</p>
                <p className="text-2xl font-bold text-white">{completedTournaments.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-[#111827] border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Medal className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">My Tournaments</p>
                <p className="text-2xl font-bold text-white">{myTournaments.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#111827] border border-gray-800 mb-6">
            <TabsTrigger value="open" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Open Registration
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="mine" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              My Tournaments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-0">
            {openTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Open Tournaments</h3>
                <p className="text-gray-400 mb-6">Create the first tournament!</p>
                <Button 
                  onClick={() => navigate('/tournaments/create')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            {activeTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Timer className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Tournaments</h3>
                <p className="text-gray-400">Tournaments will appear here once they start</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    status="active"
                    currentRound={getRoundName(tournament.total_rounds, tournament.current_round)}
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {completedTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Completed Tournaments</h3>
                <p className="text-gray-400">Finished tournaments will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    status="completed"
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine" className="mt-0">
            {myTournaments.length === 0 ? (
              <div className="text-center py-16">
                <Medal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No My Tournaments</h3>
                <p className="text-gray-400 mb-6">Join or create a tournament to see it here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Tournament Card Component
interface TournamentCardProps {
  tournament: Tournament & { creator?: { username: string; display_name: string } };
  status?: 'open' | 'active' | 'completed';
  currentRound?: string;
  onClick: () => void;
}

const TournamentCard = function TournamentCard({ tournament, onClick, currentRound }: TournamentCardProps & { currentRound?: string }) {
  const spotsLeft = tournament.max_participants - (tournament.current_participants || 0);
  const isFull = spotsLeft <= 0;

  return (
    <Card 
      onClick={onClick}
      className="bg-[#111827] border-gray-800 p-6 cursor-pointer hover:border-emerald-500/50 transition group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
            {tournament.name}
          </h3>
          <p className="text-gray-400 text-sm">{tournament.game_mode || '501'} • Single Elimination</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          tournament.status === 'registering' ? 'bg-emerald-500/20 text-emerald-400' :
          tournament.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-700 text-gray-400'
        }`}>
          {tournament.status === 'registering' ? 'OPEN' :
           tournament.status === 'active' ? 'LIVE' : 'ENDED'}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">
            {tournament.min_participants || 0} / {tournament.max_participants} players
          </span>
          {isFull && <span className="text-red-400 text-xs">(FULL)</span>}
        </div>

        {currentRound && (
          <div className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">{currentRound}</span>
          </div>
        )}

        {tournament.registration_deadline && tournament.status === 'registering' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500">
              Closes {new Date(tournament.registration_deadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            {tournament.creator?.display_name?.[0] || tournament.creator?.username?.[0] || '?'}
          </div>
          <span className="text-sm text-gray-400">
            {tournament.creator?.display_name || tournament.creator?.username || 'Unknown'}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition" />
      </div>
    </Card>
  );
};
