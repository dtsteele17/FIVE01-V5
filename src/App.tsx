import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PlayPage } from '@/pages/PlayPage';
import { QuickMatchBrowser } from '@/pages/QuickMatchBrowser';
import { QuickMatchLobby } from '@/pages/QuickMatchLobby';
import { RankedDivisionsPage } from '@/pages/RankedDivisionsPage';
import { LeaguesPage } from '@/pages/LeaguesPage';
import { LeagueDetailPage } from '@/pages/LeagueDetailPage';

import { StatsPage } from '@/pages/StatsPage';
import { StatsDashboardPage } from '@/pages/StatsDashboardPage';
import { MatchHistoryPage } from '@/pages/MatchHistoryPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { LeaderboardsPage } from '@/pages/LeaderboardsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { FriendsPage } from '@/pages/FriendsPage';

import { Training } from '@/pages/Training';
import { FinishTraining } from '@/pages/training/FinishTraining';
import { AroundTheClock } from '@/pages/training/AroundTheClock';
import { JDCChallenge } from '@/pages/training/JDCChallenge';
import { Bobs27 } from '@/pages/training/Bobs27';
import { DartBotGame } from '@/pages/DartBotGame';
import { MatchSummaryPage } from '@/pages/MatchSummaryPage';

import { GameRoom } from '@/pages/GameRoom';
import { TournamentBrowser } from '@/pages/TournamentBrowser';
import { CreateTournament } from '@/pages/CreateTournament';
import { TournamentDetail } from '@/pages/TournamentDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/play" element={<ProtectedRoute><PlayPage /></ProtectedRoute>} />
        <Route path="/quick-match" element={<ProtectedRoute><QuickMatchBrowser /></ProtectedRoute>} />
        <Route path="/lobby-create" element={<ProtectedRoute><QuickMatchLobby /></ProtectedRoute>} />
        <Route path="/ranked-divisions" element={<ProtectedRoute><RankedDivisionsPage /></ProtectedRoute>} />
        <Route path="/leagues" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
        <Route path="/league/:id" element={<ProtectedRoute><LeagueDetailPage /></ProtectedRoute>} />
        <Route path="/tournaments" element={<ProtectedRoute><TournamentBrowser /></ProtectedRoute>} />
        <Route path="/tournaments/create" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
        <Route path="/tournament/:id" element={<ProtectedRoute><TournamentDetail /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><StatsDashboardPage /></ProtectedRoute>} />
        <Route path="/stats-old" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
        <Route path="/match-history" element={<ProtectedRoute><MatchHistoryPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
        <Route path="/leaderboards" element={<ProtectedRoute><LeaderboardsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
        <Route path="/game/:id" element={<ProtectedRoute><GameRoom /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
        <Route path="/training/finish" element={<ProtectedRoute><FinishTraining /></ProtectedRoute>} />
        <Route path="/training/around-the-clock" element={<ProtectedRoute><AroundTheClock /></ProtectedRoute>} />
        <Route path="/training/jdc-challenge" element={<ProtectedRoute><JDCChallenge /></ProtectedRoute>} />
        <Route path="/training/bobs-27" element={<ProtectedRoute><Bobs27 /></ProtectedRoute>} />
        <Route path="/play/dartbot" element={<ProtectedRoute><DartBotGame /></ProtectedRoute>} />
        <Route path="/match-summary/:id" element={<ProtectedRoute><MatchSummaryPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
