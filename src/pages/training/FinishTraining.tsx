// ============================================
// FIVE01 Darts - Finish Training Page
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Target, Play, CheckCircle, Trophy 
} from 'lucide-react';
import { 
  finishTrainingService, 
  type DartThrow 
} from '../../services/trainingModes';
import VisualDartboard from '../../components/dartboard/VisualDartboard';

interface DartInput {
  score: number;
  multiplier: 1 | 2 | 3;
  segment: string;
}

export const FinishTraining: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [minCheckout, setMinCheckout] = useState<number>(40);
  const [maxCheckout, setMaxCheckout] = useState<number>(100);
  const [attemptsPerNumber, setAttemptsPerNumber] = useState<number>(3);
  const [, setSession] = useState<unknown | null>(null);
  const [currentTarget, setCurrentTarget] = useState<number>(0);
  const [currentAttempt, setCurrentAttempt] = useState<number>(1);
  const [darts, setDarts] = useState<DartInput[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successful: 0,
    successRate: 0,
  });
  const [dartboardDarts, setDartboardDarts] = useState<Array<{
    id: string;
    x: number;
    y: number;
    score: number;
    multiplier: number;
    segment: string;
  }>>([]);

  const startGame = () => {
    const newSession = finishTrainingService.startSession(minCheckout, maxCheckout, attemptsPerNumber);
    setSession(newSession);
    setCurrentTarget(finishTrainingService.getCurrentTarget());
    setCurrentAttempt(1);
    setGameState('playing');
    setDarts([]);
    setMessage(`First target: ${finishTrainingService.getCurrentTarget()}`);
    setStats({ totalAttempts: 0, successful: 0, successRate: 0 });
    setDartboardDarts([]);
  };

  const handleDartboardClick = (score: number, multiplier: number) => {
    if (darts.length >= 3) return;

    const segment = multiplier === 3 ? `T${score}` : 
                   multiplier === 2 ? `D${score}` : 
                   score === 50 ? 'BULL' : score === 25 ? 'OUTER' : `S${score}`;

    const newDart: DartInput = { score, multiplier: multiplier as 1 | 2 | 3, segment };
    const newDarts = [...darts, newDart];
    setDarts(newDarts);

    // Add to visual dartboard with random position within segment
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

    // Auto-submit after 3 darts
    if (newDarts.length === 3) {
      setTimeout(() => submitRound(newDarts), 500);
    }
  };

  const submitRound = (dartInputs: DartInput[]) => {
    const dartThrows: DartThrow[] = dartInputs.map(d => ({
      score: d.score,
      multiplier: d.multiplier,
      segment: d.segment,
    }));

    const result = finishTrainingService.recordAttempt(dartThrows);
    
    const newStats = finishTrainingService.getStats();
    setStats({
      totalAttempts: newStats.totalAttempts,
      successful: newStats.successfulAttempts,
      successRate: newStats.successRate,
    });

    if (result.completed) {
      setGameState('completed');
      setMessage('Training Complete! Great job!');
    } else {
      setCurrentTarget(finishTrainingService.getCurrentTarget());
      setCurrentAttempt(finishTrainingService.getCurrentAttemptNumber());
      setDarts([]);
      setDartboardDarts([]);
      setMessage(result.message || '');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setSession(null);
    setDarts([]);
    setDartboardDarts([]);
    setMessage('');
  };

  const getCheckoutSuggestions = (score: number): string[] => {
    return finishTrainingService.getSuggestedCheckouts(score);
  };

  // Calculate remaining after each dart
  const getRemaining = () => {
    let remaining = currentTarget;
    for (const dart of darts) {
      remaining -= dart.score * dart.multiplier;
    }
    return remaining;
  };

  const remaining = getRemaining();
  const isBust = remaining < 0 || remaining === 1;

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
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Finish Training</h1>
                  <p className="text-sm text-slate-400">Practice your checkouts</p>
                </div>
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Success Rate</p>
                  <p className="text-lg font-bold text-green-400">{stats.successRate.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Completed</p>
                  <p className="text-lg font-bold text-blue-400">{stats.successful}/{stats.totalAttempts}</p>
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
              <h2 className="text-2xl font-bold text-white mb-6">Setup Training</h2>
              
              <div className="space-y-6">
                {/* Range Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Min Checkout</label>
                    <select
                      value={minCheckout}
                      onChange={(e) => setMinCheckout(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value={2}>2 (Any Double)</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                      <option value={60}>60</option>
                      <option value={80}>80</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Max Checkout</label>
                    <select
                      value={maxCheckout}
                      onChange={(e) => setMaxCheckout(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value={40}>40</option>
                      <option value={60}>60</option>
                      <option value={80}>80</option>
                      <option value={100}>100</option>
                      <option value={120}>120</option>
                      <option value={170}>170</option>
                    </select>
                  </div>
                </div>

                {/* Attempts Per Number */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Attempts Per Number</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setAttemptsPerNumber(num)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          attemptsPerNumber === num
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all"
                >
                  <Play className="w-5 h-5" />
                  Start Training
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Target & Stats */}
            <div className="space-y-6">
              {/* Target Card */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Checkout Target</p>
                <div className="text-6xl font-bold text-white mb-4">{currentTarget}</div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-slate-400">Attempt</span>
                  <span className="font-medium text-blue-400">{currentAttempt}/{attemptsPerNumber}</span>
                </div>

                {/* Checkout Suggestions */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-sm text-yellow-400 hover:text-yellow-300"
                  >
                    {showSuggestions ? 'Hide' : 'Show'} Checkout Paths
                  </button>
                  {showSuggestions && (
                    <div className="mt-3 space-y-1">
                      {getCheckoutSuggestions(currentTarget).slice(0, 3).map((path, i) => (
                        <p key={i} className="text-sm text-slate-300">{path}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Throw Status */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Current Throw</h3>
                  {darts.length > 0 && (
                    <button
                      onClick={() => {
                        setDarts([]);
                        setDartboardDarts([]);
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Dart Inputs */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[0, 1, 2].map((i) => {
                    const dart = darts[i];
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center ${
                          dart
                            ? isBust
                              ? 'border-red-500 bg-red-500/10'
                              : remaining === 0
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 border-dashed'
                        }`}
                      >
                        {dart ? (
                          <>
                            <span className="text-xl font-bold text-white">
                              {dart.segment}
                            </span>
                            <span className="text-sm text-slate-400">
                              {dart.score * dart.multiplier}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl text-slate-600">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Remaining / Status */}
                <div className="text-center">
                  {darts.length > 0 && (
                    <>
                      <p className="text-sm text-slate-400 mb-1">Remaining</p>
                      <p className={`text-3xl font-bold ${
                        isBust ? 'text-red-400' : remaining === 0 ? 'text-green-400' : 'text-white'
                      }`}>
                        {isBust ? 'BUST!' : remaining}
                      </p>
                      {remaining === 0 && darts.length <= 3 && !isBust && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-green-400">
                          <CheckCircle className="w-5 h-5" />
                          <span>Checkout!</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Submit Button */}
                {darts.length === 3 && (
                  <button
                    onClick={() => submitRound(darts)}
                    className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                  >
                    Submit Round
                  </button>
                )}
              </div>

              {/* Message */}
              {message && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-blue-300">{message}</p>
                </div>
              )}
            </div>

            {/* Right Panel - Dartboard */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4 text-center">Click to Score</h3>
              <VisualDartboard
                darts={dartboardDarts}
                onSegmentClick={handleDartboardClick}
                isInteractive={darts.length < 3}
                size={400}
              />
            </div>
          </div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Training Complete!</h2>
              <p className="text-slate-400 mb-6">Great job practicing your checkouts</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">{stats.successRate.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Checkouts</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.successful}/{stats.totalAttempts}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                >
                  Setup New Session
                </button>
                <button
                  onClick={() => navigate('/training')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
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

export default FinishTraining;
