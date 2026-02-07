// ============================================
// FIVE01 Darts - Training Hub Page
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, Clock, Trophy, ArrowLeft, Play, 
  Info, BarChart3, Zap, Crosshair, RotateCcw 
} from 'lucide-react';

interface TrainingMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  path: string;
}

const TRAINING_MODES: TrainingMode[] = [
  {
    id: 'finish',
    name: 'Finish Training',
    description: 'Practice your checkouts with randomized target numbers. Master finishing from any score.',
    icon: <Target className="w-8 h-8" />,
    color: 'from-red-500 to-orange-500',
    features: [
      'Customizable score range (2-170)',
      '3 attempts per number',
      'Suggested checkout paths',
      'Success rate tracking',
    ],
    path: '/training/finish',
  },
  {
    id: 'aroundtheclock',
    name: 'Around the Clock',
    description: 'Hit every number from 1 to 20 in order. Classic practice game with multiple variants.',
    icon: <Clock className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Standard (singles)',
      'Doubles only',
      'Triples only',
      'Mixed mode',
    ],
    path: '/training/around-the-clock',
  },
  {
    id: 'jdc',
    name: 'JDC Challenge',
    description: '14 rounds of progressive difficulty. Used in Junior Darts Corporation training.',
    icon: <Trophy className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '10s through 15s',
      'Triples 10-15',
      'Any double',
      'Double Bull finish',
    ],
    path: '/training/jdc-challenge',
  },
  {
    id: 'bobs27',
    name: "Bob's 27",
    description: 'Start with 27 points. Hit numbers 1-20 - lose points for misses. How high can you go?',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-500',
    features: [
      '3 lives system',
      'Progressive difficulty',
      'Score tracking',
      'Hit streak bonuses',
    ],
    path: '/training/bobs-27',
  },
];

export const Training: React.FC = () => {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Practice & Training</h1>
              <p className="text-sm text-slate-400">Improve your game with focused practice modes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Training Mode</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Each training mode is designed to improve specific aspects of your dart game. 
            Track your progress and see your skills improve over time.
          </p>
        </div>

        {/* Training Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {TRAINING_MODES.map((mode) => (
            <div
              key={mode.id}
              className="group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden cursor-pointer transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20"

              onClick={() => navigate(mode.path)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${mode.color} text-white shadow-lg`}>
                    {mode.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {mode.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      {mode.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mode.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Start Button */}
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${mode.color} text-white font-medium transition-transform group-hover:scale-105`}>
                      <Play className="w-4 h-4" />
                      Start Training
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Training Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <Crosshair className="w-5 h-5 text-green-400 mb-2" />
              <h4 className="font-medium text-white mb-1">Focus on Consistency</h4>
              <p className="text-sm text-slate-400">Practice regularly, even if just for 15 minutes a day.</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
              <h4 className="font-medium text-white mb-1">Track Your Progress</h4>
              <p className="text-sm text-slate-400">Use the stats to identify areas for improvement.</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <RotateCcw className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="font-medium text-white mb-1">Vary Your Practice</h4>
              <p className="text-sm text-slate-400">Mix different training modes for well-rounded skills.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
