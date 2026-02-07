import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, Users, Trophy, ChevronDown, Play, Shield, Zap, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleJoinNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: "How does FIVE01 work?",
      a: "FIVE01 is an online darts platform where you can play 301/501 against players worldwide. Create an account, set up your camera, and start playing ranked or casual matches."
    },
    {
      q: "Do I need a camera to play?",
      a: "Yes, a camera is required for ranked matches to ensure fair play. For practice games against the bot, no camera is needed."
    },
    {
      q: "What game modes are available?",
      a: "We offer 301 and 501 with double-out options, practice mode with AI opponents, ranked matches, and private lobbies with friends."
    },
    {
      q: "Is it free to play?",
      a: "Yes! FIVE01 is completely free to play. We may introduce premium features in the future, but the core experience will always be free."
    },
    {
      q: "How does the ranking system work?",
      a: "Players start with placement matches, then earn or lose points based on match results. Climb through divisions from Bronze to Grand Champion!"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 sticky top-0 bg-[#0a0f1a]/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FIVE01</span>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-white transition-colors">Home</button>
          <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-gray-300 hover:text-white transition-colors">How It Works</button>
          <button onClick={() => scrollToSection('faq')} className="text-gray-300 hover:text-white transition-colors">FAQ</button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-white hover:text-emerald-400 transition-colors"
          >
            Log In
          </button>
          <Button 
            onClick={handleJoinNow}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 text-sm font-medium">NOW LIVE</span>
            </div>
            
            <h1 className="text-6xl font-bold text-white leading-tight">
              Play Darts<br />
              <span className="text-emerald-400">Online</span>
            </h1>
            
            <p className="text-xl text-gray-400">
              Track every throw, compete with players worldwide, and improve your game with detailed statistics.
            </p>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleJoinNow}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Playing
              </Button>
              <Button 
                variant="outline"
                onClick={() => scrollToSection('how-it-works')}
                className="border-gray-600 text-white hover:bg-gray-800 px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Column - Stats Card */}
          <div className="space-y-6">
            <Card className="bg-[#111827] border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Live Matches</p>
                  <p className="text-4xl font-bold text-white">1,247</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-500/10 rounded-lg p-4">
                  <p className="text-emerald-400 text-sm">Active Players</p>
                  <p className="text-2xl font-bold text-white">8,392</p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">Darts Today</p>
                  <p className="text-2xl font-bold text-white">45K+</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm">Top Division</p>
                <p className="text-emerald-400 font-semibold">Champion League</p>
              </div>
              
              <div className="bg-emerald-500/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Matchmaking</p>
                  <p className="text-white font-semibold">&lt; 30 seconds</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 py-16 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400">Professional features for casual and competitive players alike</p>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            <Card className="bg-[#111827] border-gray-800 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Scoring</h3>
              <p className="text-gray-400 text-sm">Real-time score tracking with checkout suggestions and statistics.</p>
            </Card>

            <Card className="bg-[#111827] border-gray-800 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Video Verification</h3>
              <p className="text-gray-400 text-sm">Built-in camera integration ensures fair play in ranked matches.</p>
            </Card>

            <Card className="bg-[#111827] border-gray-800 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Detailed Stats</h3>
              <p className="text-gray-400 text-sm">Track your averages, checkout percentages, and progress over time.</p>
            </Card>

            <Card className="bg-[#111827] border-gray-800 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ranked System</h3>
              <p className="text-gray-400 text-sm">Climb the ladder from Bronze to Grand Champion divisions.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Get started in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-400">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create Account</h3>
              <p className="text-gray-400">Sign up for free and set up your player profile in seconds.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-400">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Set Up Camera</h3>
              <p className="text-gray-400">Position your camera to show the board for verified matches.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-400">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Start Playing</h3>
              <p className="text-gray-400">Join ranked matches, play with friends, or practice against the bot.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="px-8 py-16 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Game Modes</h2>
            <p className="text-gray-400">Choose how you want to play</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/20 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ranked Matches</h3>
              <p className="text-gray-400 mb-4">Compete for points and climb the leaderboard.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• ELO-based ranking system</li>
                <li>• Division progression</li>
                <li>• Seasonal rewards</li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-500/20 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Quick Match</h3>
              <p className="text-gray-400 mb-4">Jump into casual games without affecting your rank.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Instant matchmaking</li>
                <li>• Practice new techniques</li>
                <li>• No pressure environment</li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20 p-6 card-hover">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Training</h3>
              <p className="text-gray-400 mb-4">Practice against AI with adjustable difficulty.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 7 bot difficulty levels</li>
                <li>• Checkout practice</li>
                <li>• No camera required</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Got questions? We've got answers.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="bg-[#111827] border-gray-800 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="text-white font-medium">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-16 bg-[#0d1117]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Throw?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of players already competing on FIVE01.</p>
          <Button 
            onClick={handleJoinNow}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-lg"
          >
            <Target className="w-5 h-5 mr-2" />
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Target className="w-3 h-3 text-white" />
            </div>
            <span className="text-lg font-bold text-white">FIVE01</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 FIVE01. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
