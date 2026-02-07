// ============================================
// FIVE01 Darts - JDC Challenge Page
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trophy, Play, Medal
} from 'lucide-react';
import { 
  jdcChallengeService, 
  type DartThrow 
} from '../../services/trainingModes';
import VisualDartboard from '../../components/dartboard/VisualDartboard';

interface DartInput {
  score: number;
  multiplier: 1 | 2 | 3;
  segment: string;
}

const TARGETS = [
  { round: 1, target: '10', description: '10s', type: 'single' },
  { round: 2, target: '11', description: '11s', type: 'single' },
  { round: 3, target: '12', description: '12s', type: 'single' },
  { round: 4, target: '13', description: '13s', type: 'single' },
  { round: 5, target: '14', description: '14s', type: 'single' },
  { round: 6, target: '15', description: '15s', type: 'single' },
  { round: 7, target: 'T10', description: 'T10s', type: 'triple' },
  { round: 8, target: 'T11', description: 'T11s', type: 'triple' },
  { round: 9, target: 'T12', description: 'T12s', type: 'triple' },
  { round: 10, target: 'T13', description: 'T13s', type: 'triple' },
  { round: 11, target: 'T14', description: 'T14s', type: 'triple' },
  { round: 12, target: 'T15', description: 'T15s', type: 'triple' },
  { round: 13, target: 'Any Double', description: 'Doubles', type: 'double' },
  { round: 14, target: 'Bull', description: 'Double Bull', type: 'bull' },
];

export const JDCChallenge: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [, setGame] = useState<unknown | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [darts, setDarts] = useState<DartInput[]>([]);

  const [roundScore, setRoundScore] = useState<{ score: number; bonus: number; total: number } | null>(null);
  const [stats, setStats] = useState({
    totalScore: 0,
    roundsCompleted: 0,
    totalBonus: 0,
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
    const newGame = jdcChallengeService.startGame();
    setGame(newGame);
    setCurrentRound(1);
    setGameState('playing');

    setStats({ totalScore: 0, roundsCompleted: 0, totalBonus: 0 });
    setDarts([]);
    setDartboardDarts([]);
    setRoundScore(null);
  };

  const handleDartboardClick = (score: number, multiplier: number) => {
    if (darts.length >= 3) return;

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

    const result = jdcChallengeService.recordRound(dartThrows);
    setRoundScore(result);
    
    const newStats = jdcChallengeService.getStats();
    if (newStats) {
      setStats({
        totalScore: newStats.totalScore,
        roundsCompleted: newStats.roundsCompleted,
        totalBonus: newStats.totalBonus,
      });
    }

    if (result.completed) {
      setGameState('completed');

    } else {
      jdcChallengeService.getCurrentRound();
      setCurrentRound(prev => prev + 1);
      setDarts([]);
      setDartboardDarts([]);
    }
  };

  const nextRound = () => {
    setRoundScore(null);
    setDarts([]);
    setDartboardDarts([]);
  };

  const resetGame = () => {
    setGameState('setup');
    setGame(null);
    setDarts([]);
    setDartboardDarts([]);

    setRoundScore(null);
  };

  const getCurrentTarget = () => {
    return TARGETS[currentRound - 1] || TARGETS[0];
  };

  const target = getCurrentTarget();

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
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">JDC Challenge</h1>
                  <p className="text-sm text-slate-400">14 rounds of progressive difficulty</p>
                </div>
              </div>
            </div>

            {gameState === 'playing' && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Score</p>
                  <p className="text-lg font-bold text-blue-400">{stats.totalScore}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Round</p>
                  <p className="text-lg font-bold text-green-400">{currentRound}/14</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">JDC Challenge</h2>
              <p className="text-slate-400 mb-6">
                A 14-round challenge used in Junior Darts Corporation training. 
                Progress through 10s-15s, then triples, doubles, and finish with the bull.
              </p>

              {/* Rounds Preview */}
              <div className="space-y-2 mb-8">
                {TARGETS.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg">
                    <span className="text-slate-400 text-sm">Round {t.round}</span>
                    <span className="text-white font-medium">{t.target}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-400 transition-all"
              >
                <Play className="w-5 h-5" />
                Start Challenge
              </button>
            </div>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Round Info */}
            <div className="space-y-6">
              {/* Round Card */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Round {currentRound} of 14</p>
                <div className="text-5xl font-bold text-white mb-2">{target.target}</div>
                <p className="text-blue-400">{target.description}</p>

                {/* Round Score Display */}
                {roundScore && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Score</p>
                        <p className="text-xl font-bold text-white">{roundScore.score}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Bonus</p>
                        <p className="text-xl font-bold text-yellow-400">+{roundScore.bonus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-xl font-bold text-green-400">{roundScore.total}</p>
                      </div>
                    </div>
                    <button
                      onClick={nextRound}
                      className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Next Round
                    </button>
                  </div>
                )}
              </div>

              {/* Current Throw */}
              {!roundScore && (
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
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center ${
                            dart
                              ? 'border-blue-500 bg-blue-500/10'
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

              {/* Progress */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm text-white">{Math.round((currentRound / 14) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${(currentRound / 14) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Panel - Dartboard */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="font-semibold text-white mb-4 text-center">
                Click to Score
              </h3>
              <VisualDartboard
                darts={dartboardDarts}
                onSegmentClick={handleDartboardClick}
                isInteractive={darts.length < 3 && !roundScore}
                size={400}
              />
            </div>
          </div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <Medal className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">JDC Challenge Complete!</h2>
              
              {/* Grade */}
              {(() => {
                const grade = jdcChallengeService.getGrade(stats.totalScore);
                return (
                  <p className={`text-xl font-bold mb-6 ${grade.color}`}>
                    {grade.grade}
                  </p>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Total Score</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.totalScore}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Double Bonus</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.totalBonus}</p>
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

export default JDCChallenge;
