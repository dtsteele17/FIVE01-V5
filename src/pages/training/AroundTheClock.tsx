// ============================================
// FIVE01 Darts - Around the Clock Page
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Play, CheckCircle, Trophy,
  Target, Circle, Hexagon, Shuffle
} from 'lucide-react';
import { 
  aroundTheClockService, 
  type AroundTheClockMode
} from '../../services/trainingModes';
import VisualDartboard from '../../components/dartboard/VisualDartboard';

const MODES: { id: AroundTheClockMode; name: string; icon: React.ReactNode; description: string }[] = [
  { id: 'standard', name: 'Standard', icon: <Target className="w-5 h-5" />, description: 'Hit singles 1-20 in order' },
  { id: 'doubles', name: 'Doubles', icon: <Circle className="w-5 h-5" />, description: 'Hit doubles 1-20 in order' },
  { id: 'triples', name: 'Triples', icon: <Hexagon className="w-5 h-5" />, description: 'Hit triples 1-20 in order' },
  { id: 'mixed', name: 'Mixed', icon: <Shuffle className="w-5 h-5" />, description: 'Singles (1-6), Doubles (7-13), Triples (14-20)' },
];

export const AroundTheClock: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [selectedMode, setSelectedMode] = useState<AroundTheClockMode>('standard');
  const [, setGame] = useState<unknown | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [stats, setStats] = useState({
    dartsThrown: 0,
    numbersHit: 0,
    remaining: 20,
  });
  const [dartboardDarts, setDartboardDarts] = useState<Array<{
    id: string;
    x: number;
    y: number;
    score: number;
    multiplier: number;
    segment: string;
  }>>([]);
  const [lastHit, setLastHit] = useState<boolean | null>(null);

  const startGame = () => {
    const newGame = aroundTheClockService.startGame(selectedMode);
    setGame(newGame);
    setCurrentNumber(1);
    setGameState('playing');
    setMessage('Start with number 1!');
    setStats({ dartsThrown: 0, numbersHit: 0, remaining: 20 });
    setDartboardDarts([]);
    setLastHit(null);
  };

  const handleDartboardClick = (score: number, multiplier: number) => {
    const segment = multiplier === 3 ? `T${score}` : 
                   multiplier === 2 ? `D${score}` : 
                   score === 50 ? 'BULL' : score === 25 ? 'OUTER' : `S${score}`;

    const result = aroundTheClockService.recordHit(segment);
    
    // Add visual dart
    const dartX = 45 + Math.random() * 10;
    const dartY = 45 + Math.random() * 10;
    setDartboardDarts(prev => [...prev, {
      id: `dart-${Date.now()}`,
      x: dartX,
      y: dartY,
      score,
      multiplier,
      segment,
    }]);

    setLastHit(result.hit);
    setMessage(result.message);

    const newStats = aroundTheClockService.getStats();
    if (newStats) {
      setStats({
        dartsThrown: newStats.totalDarts,
        numbersHit: newStats.numbersHit,
        remaining: newStats.remaining,
      });
    }

    if (result.completed) {
      setGameState('completed');
    } else {
      const currentGame = aroundTheClockService.getCurrentGame();
      if (currentGame) {
        setCurrentNumber(currentGame.players[0].currentNumber);
      }
    }

    // Clear darts after delay
    setTimeout(() => {
      setDartboardDarts([]);
      setLastHit(null);
    }, 1000);
  };

  const getRequiredMultiplier = () => {
    switch (selectedMode) {
      case 'doubles': return 2;
      case 'triples': return 3;
      case 'mixed':
        if (currentNumber >= 14) return 3;
        if (currentNumber >= 7) return 2;
        return 1;
      default: return 1;
    }
  };

  const getTargetDisplay = () => {
    const mult = getRequiredMultiplier();
    const prefix = mult === 3 ? 'T' : mult === 2 ? 'D' : '';
    return `${prefix}${currentNumber}`;
  };

  const resetGame = () => {
    setGameState('setup');
    setGame(null);
    setDartboardDarts([]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/training')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Around the Clock</h1>
                  <p className="text-sm text-slate-400">Hit 1-20 in order</p>
                </div>
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Progress</p>
                  <p className="text-lg font-bold text-green-400">{stats.numbersHit}/20</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Darts</p>
                  <p className="text-lg font-bold text-blue-400">{stats.dartsThrown}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Setup State */}
        {gameState === 'setup' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Select Mode</h2>
              
              <div className="space-y-3 mb-8">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedMode === mode.id
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMode === mode.id ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {mode.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{mode.name}</h3>
                        <p className="text-sm text-slate-400">{mode.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-500 hover:to-green-400 transition-all"
              >
                <Play className="w-5 h-5" />
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Target */}
            <div className="space-y-6">
              {/* Target Card */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
                <p className="text-sm text-slate-400 mb-4">Current Target</p>
                <div className="text-8xl font-bold text-white mb-6">{getTargetDisplay()}</div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${(stats.numbersHit / 20) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-slate-400">
                  {stats.remaining} numbers remaining
                </p>
              </div>

              {/* Last Hit Status */}
              {lastHit !== null && (
                <div className={`rounded-2xl border p-6 text-center ${
                  lastHit 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  {lastHit ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="w-6 h-6" />
                      <span className="text-lg font-semibold">Hit!</span>
                    </div>
                  ) : (
                    <div className="text-red-400">
                      <span className="text-lg font-semibold">Miss</span>
                    </div>
                  )}
                  <p className="text-slate-400 mt-2">{message}</p>
                </div>
              )}

              {/* Message */}
              {message && lastHit === null && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-blue-300">{message}</p>
                </div>
              )}
            </div>

            {/* Right Panel - Dartboard */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4 text-center">
                Click {getTargetDisplay()}
              </h3>
              <VisualDartboard
                darts={dartboardDarts}
                onSegmentClick={handleDartboardClick}
                isInteractive={true}
                size={400}
              />
            </div>
          </div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Around the Clock Complete!</h2>
              <p className="text-slate-400 mb-6">You hit all 20 numbers!</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Total Darts</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.dartsThrown}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Avg per Number</p>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.dartsThrown > 0 ? (stats.dartsThrown / 20).toFixed(1) : '0'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate('/training')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-500 transition-colors"
                >
                  Back to Training
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AroundTheClock;
