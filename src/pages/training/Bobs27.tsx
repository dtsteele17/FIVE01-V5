// ============================================
// FIVE01 Darts - Bob's 27 Page
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Play, Heart, HeartCrack, Trophy
} from 'lucide-react';
import { 
  bobs27Service, 
  type DartThrow 
} from '../../services/trainingModes';
import VisualDartboard from '../../components/dartboard/VisualDartboard';

interface DartInput {
  score: number;
  multiplier: 1 | 2 | 3;
  segment: string;
}

export const Bobs27: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [, setGame] = useState<unknown | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number>(1);
  const [score, setScore] = useState<number>(27);
  const [lives, setLives] = useState<number>(3);
  const [darts, setDarts] = useState<DartInput[]>([]);
  const [message, setMessage] = useState<string>('');
  const [roundResult, setRoundResult] = useState<{
    hits: number;
    pointsScored: number;
    pointsLost: number;
    netResult: number;
  } | null>(null);
  const [stats, setStats] = useState({
    roundsCompleted: 0,
    totalHits: 0,
    accuracy: '0',
    maxStreak: 0,
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
    const newGame = bobs27Service.startGame();
    setGame(newGame);
    setCurrentNumber(1);
    setScore(27);
    setLives(3);
    setGameState('playing');
    setMessage("Bob's 27 - Start with number 1!");
    setStats({
      roundsCompleted: 0,
      totalHits: 0,
      accuracy: '0',
      maxStreak: 0,
    });
    setDarts([]);
    setDartboardDarts([]);
    setRoundResult(null);
  };

  const handleDartboardClick = (score: number, multiplier: number) => {
    if (darts.length >= 3 || roundResult) return;

    const segment = multiplier === 3 ? `T${score}` : 
                   multiplier === 2 ? `D${score}` : 
                   score === 50 ? 'BULL' : score === 25 ? 'OUTER' : `S${score}`;

    const newDart: DartInput = { score, multiplier: multiplier as 1 | 2 | 3, segment };
    const newDarts = [...darts, newDart];
    setDarts(newDarts);

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

    const result = bobs27Service.recordRound(dartThrows);
    setRoundResult(result);
    setMessage(result.message);

    const newStats = bobs27Service.getStats();
    if (newStats) {
      setStats({
        roundsCompleted: newStats.roundsCompleted,
        totalHits: newStats.totalHits,
        accuracy: newStats.accuracy,
        maxStreak: newStats.maxStreak,
      });
      setScore(newStats.currentScore);
      setLives(newStats.livesRemaining);
    }

    if (result.completed || result.gameOver) {
      setGameState('completed');
    }
  };

  const nextRound = () => {
    setRoundResult(null);
    setDarts([]);
    setDartboardDarts([]);
    
    const currentGame = bobs27Service.getCurrentGame();
    if (currentGame) {
      setCurrentNumber(currentGame.currentTarget);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setGame(null);
    setDarts([]);
    setDartboardDarts([]);
    setMessage('');
    setRoundResult(null);
  };

  const getScoreColor = () => {
    if (score >= 500) return 'text-purple-400';
    if (score >= 300) return 'text-blue-400';
    if (score >= 100) return 'text-green-400';
    if (score > 0) return 'text-yellow-400';
    return 'text-red-400';
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
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Bob's 27</h1>
                  <p className="text-sm text-slate-400">Start with 27, hit 1-20 in order</p>
                </div>
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    i < lives ? (
                      <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
                    ) : (
                      <HeartCrack key={i} className="w-6 h-6 text-slate-600" />
                    )
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor()}`}>{score}</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Bob's 27</h2>
              
              <div className="space-y-4 text-slate-400 mb-8">
                <p>
                  Start with 27 points. Each round, throw at the current target number (1, 2, 3... 20).
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Hit the number = add points to your score</li>
                  <li>Miss the number = subtract points from your score</li>
                  <li>If your score reaches 0, you lose a life (max 3)</li>
                  <li>Survive all 20 rounds for your final score!</li>
                </ul>
              </div>

              {/* Scoring Examples */}
              <div className="bg-slate-800 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-white mb-3">Scoring Examples</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Round 5, hit S5, T5, miss</span>
                    <span className="text-green-400">+20 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Round 5, all misses</span>
                    <span className="text-red-400">-15 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Round 10, hit T10, T10, S10</span>
                    <span className="text-green-400">+70 points</span>
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-400 transition-all"
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
            {/* Left Panel */}
            <div className="space-y-6">
              {/* Target Card */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Current Target</p>
                <div className="text-7xl font-bold text-white mb-4">{currentNumber}</div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-slate-400">Progress: {currentNumber}/20</span>
                  <div className="w-20 bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                      style={{ width: `${(currentNumber / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Round Result */}
              {roundResult && (
                <div className={`rounded-2xl border p-6 ${
                  roundResult.netResult >= 0 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <p className="text-xs text-slate-400">Hits</p>
                      <p className="text-xl font-bold text-white">{roundResult.hits}/3</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Scored</p>
                      <p className="text-xl font-bold text-green-400">+{roundResult.pointsScored}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Lost</p>
                      <p className="text-xl font-bold text-red-400">-{roundResult.pointsLost}</p>
                    </div>
                  </div>
                  <div className="text-center pt-4 border-t border-slate-700/50">
                    <p className="text-sm text-slate-400">Net Result</p>
                    <p className={`text-3xl font-bold ${
                      roundResult.netResult >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {roundResult.netResult > 0 ? '+' : ''}{roundResult.netResult}
                    </p>
                  </div>
                  {currentNumber < 20 && (
                    <button
                      onClick={nextRound}
                      className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                    >
                      Next Round
                    </button>
                  )}
                </div>
              )}

              {/* Current Throw */}
              {!roundResult && (
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
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => {
                      const dart = darts[i];
                      const isTargetHit = dart && dart.score === currentNumber;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center ${
                            dart
                              ? isTargetHit
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-slate-600 bg-slate-800/50'
                              : 'border-slate-700 border-dashed'
                          }`}
                        >
                          {dart ? (
                            <>
                              <span className={`text-xl font-bold ${
                                isTargetHit ? 'text-green-400' : 'text-slate-400'
                              }`}>
                                {dart.segment}
                              </span>
                              <span className="text-sm text-slate-500">
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

                  {/* Submit */}
                  {darts.length === 3 && (
                    <button
                      onClick={() => submitRound(darts)}
                      className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                    >
                      Submit Round
                    </button>
                  )}
                </div>
              )}

              {/* Message */}
              {message && !roundResult && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-blue-300">{message}</p>
                </div>
              )}
            </div>

            {/* Right Panel - Dartboard */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4 text-center">
                Click to hit {currentNumber}
              </h3>
              <VisualDartboard
                darts={dartboardDarts}
                onSegmentClick={handleDartboardClick}
                isInteractive={darts.length < 3 && !roundResult}
                size={400}
              />
            </div>
          </div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                {lives > 0 ? (
                  <Trophy className="w-10 h-10 text-white" />
                ) : (
                  <HeartCrack className="w-10 h-10 text-white" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                {lives > 0 ? "Bob's 27 Complete!" : "Game Over!"}
              </h2>
              
              {lives > 0 && (() => {
                const grade = bobs27Service.getGrade(score);
                return (
                  <p className={`text-xl font-bold mb-6 ${grade.color}`}>
                    {grade.grade}
                  </p>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Final Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor()}`}>{score}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Accuracy</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.accuracy}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Total Hits</p>
                  <p className="text-xl font-bold text-green-400">{stats.totalHits}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Max Streak</p>
                  <p className="text-xl font-bold text-yellow-400">{stats.maxStreak}</p>
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
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 transition-colors"
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

export default Bobs27;
