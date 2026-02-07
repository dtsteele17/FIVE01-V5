-- ============================================
-- FIVE01 Darts - Complete Supabase Setup
-- Run this in a FRESH Supabase project
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  elo INTEGER DEFAULT 1200,
  tier TEXT DEFAULT 'Bronze',
  division INTEGER DEFAULT 1,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  darts_thrown INTEGER DEFAULT 0,
  total_scored INTEGER DEFAULT 0,
  checkout_attempts INTEGER DEFAULT 0,
  checkouts_made INTEGER DEFAULT 0,
  highest_checkout INTEGER DEFAULT 0,
  tons INTEGER DEFAULT 0,
  ton40s INTEGER DEFAULT 0,
  ton80s INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FRIENDS TABLE
-- ============================================
CREATE TABLE friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Friends are viewable by everyone"
  ON friends FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own friendships"
  ON friends FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'abandoned')),
  game_mode_id TEXT DEFAULT '501',
  legs_to_win INTEGER DEFAULT 3,
  sets_to_win INTEGER DEFAULT 1,
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  current_leg INTEGER DEFAULT 1,
  current_set INTEGER DEFAULT 1,
  current_player_id UUID REFERENCES profiles(id),
  player1_legs_won INTEGER DEFAULT 0,
  player2_legs_won INTEGER DEFAULT 0,
  player1_sets_won INTEGER DEFAULT 0,
  player2_sets_won INTEGER DEFAULT 0,
  is_ranked BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  invite_code TEXT,
  is_vs_bot BOOLEAN DEFAULT false,
  bot_level INTEGER,
  forfeited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  double_out BOOLEAN DEFAULT true
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Players can create matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their matches"
  ON matches FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- ============================================
-- LEGS TABLE
-- ============================================
CREATE TABLE legs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  leg_number INTEGER NOT NULL,
  set_number INTEGER DEFAULT 1,
  winner_id UUID REFERENCES profiles(id),
  player1_starting_score INTEGER DEFAULT 501,
  player2_starting_score INTEGER DEFAULT 501,
  player1_remaining INTEGER DEFAULT 501,
  player2_remaining INTEGER DEFAULT 501,
  player1_marks JSONB DEFAULT '{}',
  player2_marks JSONB DEFAULT '{}',
  player1_points INTEGER DEFAULT 0,
  player2_points INTEGER DEFAULT 0,
  player1_darts_thrown INTEGER DEFAULT 0,
  player2_darts_thrown INTEGER DEFAULT 0,
  player1_total_scored INTEGER DEFAULT 0,
  player2_total_scored INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE legs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legs are viewable by everyone"
  ON legs FOR SELECT
  USING (true);

-- ============================================
-- VISITS TABLE (dart throws)
-- ============================================
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  leg_id UUID REFERENCES legs(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id),
  visit_number INTEGER NOT NULL,
  dart1_score INTEGER,
  dart1_multiplier INTEGER DEFAULT 1,
  dart2_score INTEGER,
  dart2_multiplier INTEGER DEFAULT 1,
  dart3_score INTEGER,
  dart3_multiplier INTEGER DEFAULT 1,
  total_scored INTEGER DEFAULT 0,
  remaining_before INTEGER NOT NULL,
  remaining_after INTEGER NOT NULL,
  is_bust BOOLEAN DEFAULT false,
  is_checkout BOOLEAN DEFAULT false,
  checkout_attempt BOOLEAN DEFAULT false,
  marks JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visits are viewable by everyone"
  ON visits FOR SELECT
  USING (true);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  max_participants INTEGER DEFAULT 32,
  game_mode TEXT DEFAULT '501',
  format TEXT DEFAULT 'single_elimination',
  status TEXT DEFAULT 'registering' CHECK (status IN ('registering', 'active', 'completed')),
  registration_deadline TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_round INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 0,
  winner_id UUID REFERENCES profiles(id),
  entry_fee INTEGER DEFAULT 0,
  prize_pool INTEGER DEFAULT 0,
  double_out BOOLEAN DEFAULT true,
  legs_to_win INTEGER DEFAULT 3,
  registration_open BOOLEAN DEFAULT true,
  min_participants INTEGER DEFAULT 4,
  check_in_required BOOLEAN DEFAULT false,
  check_in_deadline TIMESTAMP WITH TIME ZONE
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tournaments"
  ON tournaments FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================
-- TOURNAMENT PARTICIPANTS
-- ============================================
CREATE TABLE tournament_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seed INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'eliminated', 'winner')),
  final_position INTEGER,
  prize_won INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tournament_id, player_id)
);

ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournament participants are viewable by everyone"
  ON tournament_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- ============================================
-- TOURNAMENT MATCHES
-- ============================================
CREATE TABLE tournament_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  bracket_position TEXT,
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'waiting', 'in_progress', 'completed', 'bye')),
  player1_legs_won INTEGER DEFAULT 0,
  player2_legs_won INTEGER DEFAULT 0,
  match_id UUID REFERENCES matches(id),
  next_match_id UUID REFERENCES tournament_matches(id),
  next_match_position INTEGER,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournament matches are viewable by everyone"
  ON tournament_matches FOR SELECT
  USING (true);

-- ============================================
-- LEAGUES TABLE
-- ============================================
CREATE TABLE leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  max_players INTEGER DEFAULT 20,
  is_public BOOLEAN DEFAULT true,
  join_code TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'active', 'completed')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leagues are viewable by everyone"
  ON leagues FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create leagues"
  ON leagues FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================
-- LEAGUE MEMBERS
-- ============================================
CREATE TABLE league_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, player_id)
);

ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "League members are viewable by everyone"
  ON league_members FOR SELECT
  USING (true);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Trophy',
  category TEXT NOT NULL DEFAULT 'match',
  tier TEXT NOT NULL DEFAULT 'bronze',
  requirement_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  CONSTRAINT achievements_category_check CHECK (category IN ('match', 'scoring', 'checkout', 'training', 'social', 'special')),
  CONSTRAINT achievements_tier_check CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, tier, requirement_value, xp_reward) VALUES
('First Victory', 'Win your first match', 'Trophy', 'match', 'bronze', 1, 100),
('On Fire', 'Win 3 matches in a row', 'Flame', 'match', 'silver', 3, 250),
('Maximum!', 'Hit your first 180', 'Crown', 'scoring', 'silver', 1, 300),
('Finisher', 'Complete 10 checkouts', 'CheckCircle', 'checkout', 'bronze', 10, 150);

-- ============================================
-- PLAYER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE player_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, achievement_id)
);

ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Player achievements are viewable by everyone"
  ON player_achievements FOR SELECT
  USING (true);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- MATCH EVENTS TABLE
-- ============================================
CREATE TABLE match_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  player_id UUID REFERENCES profiles(id),
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match events are viewable by everyone"
  ON match_events FOR SELECT
  USING (true);

-- ============================================
-- REALTIME SETUP
-- ============================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add tables to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE legs;
ALTER PUBLICATION supabase_realtime ADD TABLE visits;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- DONE!
-- ============================================
SELECT 'FIVE01 Darts database setup complete!' as status;
