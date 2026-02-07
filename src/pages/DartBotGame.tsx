// ============================================
// FIVE01 Darts - DartBot Game Page
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bot, User, Trophy
} from 'lucide-react';
import { SmartDartBot, type DartBotLevel } from '../services/smartDartBot';
import PNGDartboard from '../components/dartboard/PNGDartboard';

interface Visit {
  player: 'player' | 'bot';
  darts: number[];
  total: number;
  remaining: number;
  isBust: boolean;
}

interface GameState {
  playerScore: number;
  botScore: number;
  currentPlayer: 'player' | 'bot';
  playerLegs: number;
  botLegs: number;
  gameOver: boolean;
  winner: string | null;
  visits: Visit[];
}

const BOT_LEVELS: { level: DartBotLevel; name: string; description: string }[] = [
  { level: 25, name: 'Beginner', description: 'Just starting out' },
  { level: 35, name: 'Novice', description: 'Learning the basics' },
  { level: 45, name: 'Casual', description: 'Plays occasionally' },
  { level: 55, name: 'Intermediate', description: 'Regular player' },
  { level: 65, name: 'Advanced', description: 'Club player' },
  { level: 75, name: 'Expert', description: 'Serious competitor' },
  { level: 85, name: 'Pro', description: 'Professional level' },
  { level: 95, name: 'Elite', description: 'World class' },
];

export const DartBotGame: React.FC = () => {
  const navigate = useNavigate();

  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [selectedLevel, setSelectedLevel] = useState<DartBotLevel>(55);
  const [gameMode, setGameMode] = useState<'501' | '301'>('501');
  const [legsToWin, setLegsToWin] = useState<number>(1);

  const [dartbot, setDartbot] = useState<SmartDartBot | null>(null);
  const [doubleOut, setDoubleOut] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>({
    playerScore: 501,
    botScore: 501,
    currentPlayer: 'player',
    playerLegs: 0,
    botLegs: 0,
    gameOver: false,
    winner: null,
    visits: [],
  });

  const [playerDarts, setPlayerDarts] = useState<{score: number; multiplier: number; segment: string}[]>([]);
  const [dartboardDarts, setDartboardDarts] = useState<Array<{
    id: string;
    x: number;
    y: number;
    score: number;
    multiplier: number;
    segment: string;
  }>>([]);

  const [inputMethod, setInputMethod] = useState<'keypad' | 'total'>('keypad');
  const [totalScoreInput, setTotalScoreInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'singles' | 'doubles' | 'triples' | 'bulls'>('singles');
  const [isProcessing, setIsProcessing] = useState(false);

  // Start a new game
  const startGame = () => {
    const botInstance = new SmartDartBot(selectedLevel);
    setDartbot(botInstance);

    const startingScore = gameMode === '501' ? 501 : 301;

    setGameState({
      playerScore: startingScore,
      botScore: startingScore,
      currentPlayer: 'player',
      playerLegs: 0,
      botLegs: 0,
      gameOver: false,
      winner: null,
      visits: [],
    });

    setPlayerDarts([]);
    setDartboardDarts([]);
    setTotalScoreInput('');
    setGamePhase('playing');
  };

  // Handle segment button click
  const handleSegmentClick = (score: number, multiplier: number) => {
    if (gameState.currentPlayer !== 'player' || gameState.gameOver || isProcessing) return;
    if (playerDarts.length >= 3) return;

    const segment = multiplier === 3 ? `T${score}` :
                   multiplier === 2 ? `D${score}` :
                   score === 50 ? 'BULL' : score === 25 ? 'OUTER' : `S${score}`;

    const newDart = { score, multiplier, segment };
    const newDarts = [...playerDarts, newDart];
    setPlayerDarts(newDarts);

    // Add to visual dartboard
    const angle = Math.random() * 2 * Math.PI;
    const radius = 45 + Math.random() * 5;
    const dartX = 50 + radius * Math.cos(angle);
    const dartY = 50 + radius * Math.sin(angle);

    setDartboardDarts(prev => [...prev, {
      id: `player-dart-${Date.now()}`,
      x: dartX,
      y: dartY,
      score,
      multiplier,
      segment,
    }]);
  };

  // Handle keypad input
  const handleKeypadInput = (score: number, multiplier: number) => {
    handleSegmentClick(score, multiplier);
  };

  // Handle total score submission
  const handleTotalSubmit = () => {
    const total = parseInt(totalScoreInput);
    if (isNaN(total) || total < 0 || total > 180) {
      alert('Please enter a valid score between 0 and 180');
      return;
    }

    // Create a simple visit with the total score
    const darts = [{ score: total, multiplier: 1, segment: `${total}` }];
    submitPlayerVisit(darts, total);
    setTotalScoreInput('');
  };

  // Handle clear
  const handleClear = () => {
    setPlayerDarts([]);
    setDartboardDarts([]);
    setTotalScoreInput('');
  };

  // Handle bust
  const handleBust = () => {
    submitPlayerVisit([], 0);
  };

  // Handle miss
  const handleMiss = () => {
    if (playerDarts.length >= 3) return;
    handleSegmentClick(0, 1);
  };

  // Submit visit
  const handleSubmitVisit = () => {
    if (playerDarts.length === 0) return;

    const totalScored = playerDarts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);
    submitPlayerVisit(playerDarts, totalScored);
  };

  // Submit player visit
  const submitPlayerVisit = (darts: {score: number; multiplier: number; segment: string}[], totalScored: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    let newScore = gameState.playerScore - totalScored;
    let isBust = false;

    // Check for bust
    if (newScore < 0 || newScore === 1) {
      newScore = gameState.playerScore;
      isBust = true;
    }

    // Check for win
    if (newScore === 0 && !isBust) {
      const lastDart = darts[darts.length - 1];
      const isValidFinish = !doubleOut || (lastDart && (lastDart.multiplier === 2 || lastDart.score === 50));

      if (isValidFinish) {
        const visit: Visit = {
          player: 'player',
          darts: darts.map(d => d.score * d.multiplier),
          total: totalScored,
          remaining: 0,
          isBust: false,
        };

        setGameState(prev => ({
          ...prev,
          visits: [...prev.visits, visit],
        }));

        setTimeout(() => {
          handleLegWin('player');
          setIsProcessing(false);
        }, 500);
        return;
      } else {
        newScore = gameState.playerScore;
        isBust = true;
      }
    }

    const visit: Visit = {
      player: 'player',
      darts: darts.map(d => d.score * d.multiplier),
      total: isBust ? 0 : totalScored,
      remaining: newScore,
      isBust,
    };

    setGameState(prev => ({
      ...prev,
      playerScore: newScore,
      currentPlayer: 'bot',
      visits: [...prev.visits, visit],
    }));

    setPlayerDarts([]);
    setDartboardDarts([]);
    setTotalScoreInput('');

    // Bot turn after delay
    setTimeout(() => {
      setIsProcessing(false);
      handleBotTurn();
    }, 1000);
  };

  // Handle bot turn
  const handleBotTurn = async () => {
    if (!dartbot || gameState.gameOver) return;
    setIsProcessing(true);

    const { darts, positions } = dartbot.generateVisit(gameState.botScore);
    let cumulativeScore = 0;
    let currentBotScore = gameState.botScore;

    for (let i = 0; i < darts.length; i++) {
      const dart = darts[i];
      const position = positions[i];
      const dartValue = dart.score * dart.multiplier;

      await new Promise(resolve => setTimeout(resolve, 1200));

      setDartboardDarts(prev => [...prev, {
        id: `bot-dart-${Date.now()}-${i}`,
        x: position.x,
        y: position.y,
        score: dart.score,
        multiplier: dart.multiplier,
        segment: dart.segment,
      }]);

      await new Promise(resolve => setTimeout(resolve, 400));

      cumulativeScore += dartValue;
      const potentialScore = gameState.botScore - cumulativeScore;

      if (potentialScore < 0 || potentialScore === 1) {
        const visit: Visit = {
          player: 'bot',
          darts: darts.slice(0, i + 1).map(d => d.score * d.multiplier),
          total: 0,
          remaining: gameState.botScore,
          isBust: true,
        };

        setGameState(prev => ({
          ...prev,
          currentPlayer: 'player',
          visits: [...prev.visits, visit],
        }));

        setDartboardDarts([]);
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsProcessing(false);
        return;
      }

      currentBotScore = potentialScore;

      if (currentBotScore === 0) {
        const isValidFinish = !doubleOut || (dart.multiplier === 2 || dart.score === 50);

        if (isValidFinish) {
          const visit: Visit = {
            player: 'bot',
            darts: darts.slice(0, i + 1).map(d => d.score * d.multiplier),
            total: cumulativeScore,
            remaining: 0,
            isBust: false,
          };

          setGameState(prev => ({
            ...prev,
            botScore: 0,
            visits: [...prev.visits, visit],
          }));

          setDartboardDarts([]);
          await new Promise(resolve => setTimeout(resolve, 800));
          handleLegWin('bot');
          setIsProcessing(false);
          return;
        } else {
          const visit: Visit = {
            player: 'bot',
            darts: darts.slice(0, i + 1).map(d => d.score * d.multiplier),
            total: 0,
            remaining: gameState.botScore,
            isBust: true,
          };

          setGameState(prev => ({
            ...prev,
            currentPlayer: 'player',
            visits: [...prev.visits, visit],
          }));

          setDartboardDarts([]);
          await new Promise(resolve => setTimeout(resolve, 400));
          setIsProcessing(false);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 400));
    }

    const visit: Visit = {
      player: 'bot',
      darts: darts.map(d => d.score * d.multiplier),
      total: cumulativeScore,
      remaining: currentBotScore,
      isBust: false,
    };

    setGameState(prev => ({
      ...prev,
      botScore: currentBotScore,
      currentPlayer: 'player',
      visits: [...prev.visits, visit],
    }));

    setDartboardDarts([]);
    setIsProcessing(false);
  };

  // Handle leg win
  const handleLegWin = (winner: 'player' | 'bot') => {
    const isMatchWin = winner === 'player'
      ? gameState.playerLegs + 1 >= legsToWin
      : gameState.botLegs + 1 >= legsToWin;

    if (isMatchWin) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        winner: winner === 'player' ? 'You' : `DartBot ${selectedLevel}`,
        playerLegs: winner === 'player' ? prev.playerLegs + 1 : prev.playerLegs,
        botLegs: winner === 'bot' ? prev.botLegs + 1 : prev.botLegs,
      }));
      setGamePhase('finished');
    } else {
      // Reset for next leg
      const startingScore = gameMode === '501' ? 501 : 301;

      setGameState(prev => ({
        ...prev,
        playerScore: startingScore,
        botScore: startingScore,
        playerLegs: winner === 'player' ? prev.playerLegs + 1 : prev.playerLegs,
        botLegs: winner === 'bot' ? prev.botLegs + 1 : prev.botLegs,
        currentPlayer: 'player',
        visits: [],
      }));

      setPlayerDarts([]);
      setDartboardDarts([]);
    }
  };

  // Calculate current remaining score
  const getCurrentRemaining = () => {
    if (gameState.currentPlayer === 'player') {
      let remaining = gameState.playerScore;
      for (const dart of playerDarts) {
        remaining -= dart.score * dart.multiplier;
      }
      return remaining;
    }
    return gameState.botScore;
  };

  const currentRemaining = getCurrentRemaining();
  const visitTotal = playerDarts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">DartBot Training</h1>
                  <p className="text-sm text-slate-400">{gameMode} • Level {selectedLevel}</p>
                </div>
              </div>
            </div>

            {gamePhase === 'playing' && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Legs</p>
                  <p className="text-2xl font-bold text-white">
                    {gameState.playerLegs} - {gameState.botLegs}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Setup Phase */}
        {gamePhase === 'setup' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Setup Game</h2>

              {/* Bot Level Selection */}
              <div className="mb-8">
                <label className="block text-sm text-slate-400 mb-3">Select DartBot Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BOT_LEVELS.map(({ level, name, description }) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedLevel === level
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-white mb-1">Level {level}</div>
                      <div className="text-sm text-slate-400">{name}</div>
                      <div className="text-xs text-slate-500 mt-1">{description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode */}
              <div className="mb-8">
                <label className="block text-sm text-slate-400 mb-3">Game Mode</label>
                <div className="flex gap-3">
                  {(['501', '301'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setGameMode(mode)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        gameMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legs to Win */}
              <div className="mb-8">
                <label className="block text-sm text-slate-400 mb-3">Legs to Win</label>
                <div className="flex gap-3">
                  {[1, 3, 5, 7].map((legs) => (
                    <button
                      key={legs}
                      onClick={() => setLegsToWin(legs)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                        legsToWin === legs
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {legs === 1 ? '1 Leg' : `Best of ${legs}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Double Out */}
              <div className="mb-8">
                <label className="block text-sm text-slate-400 mb-3">Finish Rule</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDoubleOut(true)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      doubleOut
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Double Out
                  </button>
                  <button
                    onClick={() => setDoubleOut(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      !doubleOut
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Straight Out
                  </button>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-400 transition-all"
              >
                <Bot className="w-5 h-5" />
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Playing Phase */}
        {gamePhase === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left - Dartboard */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-9xl font-bold text-white mb-2" style={{ fontSize: '8rem', lineHeight: '1' }}>
                      {gameState.currentPlayer === 'player' ? gameState.playerScore : gameState.botScore}
                    </div>
                    <div className="text-xl text-slate-400 font-medium">
                      {gameState.currentPlayer === 'player' ? 'Your Turn' : 'DartBot Throwing...'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-4 mb-2">
                      <div>
                        <User className="w-5 h-5 text-blue-400 inline mr-1" />
                        <span className="text-4xl font-bold text-white">{gameState.playerLegs}</span>
                      </div>
                      <div>
                        <Bot className="w-5 h-5 text-purple-400 inline mr-1" />
                        <span className="text-4xl font-bold text-white">{gameState.botLegs}</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Legs Won</div>
                  </div>
                </div>

                <PNGDartboard
                  darts={dartboardDarts}
                  size={420}
                />
              </div>
            </div>

            {/* Center - Visit History */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 h-full">
                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase">Visit History</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {gameState.visits.slice().reverse().map((visit, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        visit.player === 'player'
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-purple-500/10 border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-400">
                          {visit.player === 'player' ? 'You' : 'DartBot'}
                        </span>
                        <span className="text-xs text-slate-500">
                          → {visit.remaining}
                        </span>
                      </div>
                      <div className="flex gap-2 mb-1">
                        {visit.darts.map((score, i) => (
                          <span key={i} className="text-sm font-mono text-white bg-slate-800 px-2 py-0.5 rounded">
                            {score}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">
                          {visit.total}
                        </span>
                        {visit.isBust && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                            BUST
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Scoring Input */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase">Score Input</h3>

                {/* Input Method Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setInputMethod('keypad')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      inputMethod === 'keypad'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    disabled={gameState.currentPlayer !== 'player' || isProcessing}
                  >
                    Keypad
                  </button>
                  <button
                    onClick={() => setInputMethod('total')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      inputMethod === 'total'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    disabled={gameState.currentPlayer !== 'player' || isProcessing}
                  >
                    Total Score
                  </button>
                </div>

                {/* Current Throw Display */}
                <div className="mb-4 p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Current Throw</span>
                    <span className="text-xs text-slate-400">
                      Total: <span className="font-bold text-white">{visitTotal}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[0, 1, 2].map((i) => {
                      const dart = playerDarts[i];
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                            dart
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-slate-700 border-dashed'
                          }`}
                        >
                          {dart ? (
                            <span className="font-bold text-white">{dart.segment}</span>
                          ) : (
                            <span className="text-slate-600">{i + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-white">{currentRemaining}</span>
                    <span className="text-xs text-slate-400 ml-2">remaining</span>
                  </div>
                </div>

                {/* Total Score Input */}
                {inputMethod === 'total' && (
                  <div className="mb-4">
                    <input
                      type="number"
                      value={totalScoreInput}
                      onChange={(e) => setTotalScoreInput(e.target.value)}
                      placeholder="Enter total score (0-180)"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      disabled={gameState.currentPlayer !== 'player' || isProcessing}
                      max={180}
                      min={0}
                    />
                  </div>
                )}

                {/* Keypad Input */}
                {inputMethod === 'keypad' && (
                  <div className="mb-4">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3 overflow-x-auto">
                      {(['singles', 'doubles', 'triples', 'bulls'] as const).map((tab) => {
                        const tabColors = {
                          singles: activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
                          doubles: activeTab === tab ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
                          triples: activeTab === tab ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
                          bulls: activeTab === tab ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
                        };

                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tabColors[tab]}`}
                            disabled={gameState.currentPlayer !== 'player' || isProcessing}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Segment Buttons */}
                    <div className={`grid grid-cols-5 gap-1.5 max-h-[280px] overflow-y-auto p-2 rounded-lg ${
                      activeTab === 'singles' ? 'bg-blue-900/10' :
                      activeTab === 'doubles' ? 'bg-green-900/10' :
                      activeTab === 'triples' ? 'bg-red-900/10' :
                      'bg-amber-900/10'
                    }`}>
                      {activeTab === 'bulls' ? (
                        <>
                          <button
                            onClick={() => handleKeypadInput(25, 1)}
                            className="aspect-square bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            disabled={gameState.currentPlayer !== 'player' || playerDarts.length >= 3 || isProcessing}
                          >
                            25
                          </button>
                          <button
                            onClick={() => handleKeypadInput(50, 1)}
                            className="aspect-square bg-amber-900/50 hover:bg-amber-900/70 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            disabled={gameState.currentPlayer !== 'player' || playerDarts.length >= 3 || isProcessing}
                          >
                            BULL
                          </button>
                        </>
                      ) : (
                        Array.from({ length: 20 }, (_, i) => i + 1).map((num) => {
                          const mult = activeTab === 'singles' ? 1 : activeTab === 'doubles' ? 2 : 3;
                          const prefix = activeTab === 'singles' ? 'S' : activeTab === 'doubles' ? 'D' : 'T';
                          return (
                            <button
                              key={num}
                              onClick={() => handleKeypadInput(num, mult)}
                              className="aspect-square bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                              disabled={gameState.currentPlayer !== 'player' || playerDarts.length >= 3 || isProcessing}
                            >
                              {prefix}{num}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleClear}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    disabled={gameState.currentPlayer !== 'player' || (playerDarts.length === 0 && !totalScoreInput) || isProcessing}
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleMiss}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    disabled={gameState.currentPlayer !== 'player' || playerDarts.length >= 3 || isProcessing || inputMethod === 'total'}
                  >
                    Miss (0)
                  </button>
                  <button
                    onClick={handleBust}
                    className="py-3 bg-red-900/50 hover:bg-red-900/70 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    disabled={gameState.currentPlayer !== 'player' || isProcessing}
                  >
                    Bust
                  </button>
                  <button
                    onClick={inputMethod === 'total' ? handleTotalSubmit : handleSubmitVisit}
                    className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    disabled={
                      gameState.currentPlayer !== 'player' ||
                      (inputMethod === 'keypad' && playerDarts.length === 0) ||
                      (inputMethod === 'total' && !totalScoreInput) ||
                      isProcessing
                    }
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finished Phase */}
        {gamePhase === 'finished' && (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Match Complete!</h2>
              <p className="text-xl text-slate-400 mb-6">
                {gameState.winner} wins!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Final Score</p>
                  <p className="text-2xl font-bold text-blue-400">{gameState.playerLegs} - {gameState.botLegs}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-sm text-slate-400">Visits</p>
                  <p className="text-2xl font-bold text-purple-400">{gameState.visits.length}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setGamePhase('setup')}
                  className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                >
                  New Game
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DartBotGame;
