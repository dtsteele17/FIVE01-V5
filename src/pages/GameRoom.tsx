import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameEngine, type DartThrow } from '@/services/gameEngine';
import { webRTCService } from '@/services/webrtcService';
import { useAuthStore } from '@/store';
import { CameraSetup } from '@/components/CameraSetup';
import type { GameState } from '@/services/gameEngine';
import { Camera, CameraOff, MonitorUp } from 'lucide-react';

interface DartScore {
  score: number;
  multiplier: 1 | 2 | 3;
}

export function GameRoom() {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  // State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentDarts, setCurrentDarts] = useState<DartScore[]>([]);
  const [activeDart, setActiveDart] = useState(0); // 0, 1, 2
  const [activeTab, setActiveTab] = useState<'20' | '19' | '18' | '17' | '16' | '15' | 'Bull'>('20');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [showRemoteCamera, setShowRemoteCamera] = useState(false);
  const [, setVisitHistory] = useState<any[]>([]);
  const [cameraSetupComplete, setCameraSetupComplete] = useState(false);
  const [localCameraEnabled, setLocalCameraEnabled] = useState(true);

  // Initialize game
  useEffect(() => {
    if (!matchId || !user) return;

    const opponentId = gameState?.match.player1_id === user.id 
      ? gameState?.match.player2_id 
      : gameState?.match.player1_id;

    // Initialize WebRTC
    const initWebRTC = async () => {
      if (localVideoRef.current && opponentId) {
        try {
          await webRTCService.initialize(
            matchId,
            user.id,
            opponentId,
            localVideoRef.current,
            (remoteStream: MediaStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                setShowRemoteCamera(true);
              }
            },
            (state: RTCPeerConnectionState) => setConnectionState(state)
          );

          // Create offer if we're player 1
          if (gameState?.match.player1_id === user.id) {
            setTimeout(() => webRTCService.createOffer(), 1000);
          }
        } catch (error) {
          console.error('WebRTC init error:', error);
        }
      }
    };

    // Initialize GameEngine
    gameEngineRef.current = new GameEngine(matchId, user.id);
    gameEngineRef.current.initialize(
      (state) => {
        setGameState(state);
        setIsMyTurn(state.isMyTurn);
        setVisitHistory(state.visits);
        
        // Reset darts on turn change
        if (state.isMyTurn) {
          setCurrentDarts([]);
          setActiveDart(0);
        }
      },
      (myTurn) => setIsMyTurn(myTurn),
      () => {
        // Game ended
        navigate(`/match-summary/${matchId}`);
      },
      () => {
        // Leg ended
        setCurrentDarts([]);
        setActiveDart(0);
      }
    );

    initWebRTC();

    return () => {
      gameEngineRef.current?.destroy();
      webRTCService.close();
    };
  }, [matchId, user, navigate, gameState?.match.player1_id, gameState?.match.player2_id]);

  // Handle dart input
  const handleDartInput = useCallback((score: number, multiplier: 1 | 2 | 3) => {
    if (!isMyTurn || activeDart >= 3) return;

    const newDarts = [...currentDarts];
    newDarts[activeDart] = { score, multiplier };
    setCurrentDarts(newDarts);
    
    if (activeDart < 2) {
      setActiveDart(activeDart + 1);
    }
  }, [isMyTurn, activeDart, currentDarts]);

  // Undo last dart
  const handleUndo = useCallback(() => {
    if (activeDart > 0) {
      const newDarts = [...currentDarts];
      newDarts.pop();
      setCurrentDarts(newDarts);
      setActiveDart(activeDart - 1);
    }
  }, [activeDart, currentDarts]);

  // Clear all darts
  const handleClear = useCallback(() => {
    setCurrentDarts([]);
    setActiveDart(0);
  }, []);

  // Submit visit
  const handleSubmit = useCallback(async () => {
    if (!isMyTurn || currentDarts.length === 0) return;

    try {
      const darts: DartThrow[] = currentDarts.map(d => ({
        score: d.score,
        multiplier: d.multiplier,
        segment: d.score.toString(),
      }));

      // Pad to 3 darts if needed
      while (darts.length < 3) {
        darts.push({ score: 0, multiplier: 1, segment: '0' });
      }

      await gameEngineRef.current?.submitDartThrow(darts);
      setCurrentDarts([]);
      setActiveDart(0);
    } catch (error: any) {
      alert(error.message);
    }
  }, [isMyTurn, currentDarts]);

  // Calculate current score
  const getCurrentScore = () => {
    if (!gameState) return 0;
    return gameState.currentPlayerId === gameState.match.player1_id
      ? gameState.player1Score
      : gameState.player2Score;
  };

  // Calculate total scored this visit
  const getVisitTotal = () => {
    return currentDarts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);
  };

  // Calculate remaining after this visit
  const getRemainingAfter = () => {
    return getCurrentScore() - getVisitTotal();
  };

  // Check if bust
  const isBust = () => {
    const remaining = getRemainingAfter();
    return remaining < 0 || remaining === 1;
  };

  // Get checkout suggestion
  const getCheckoutSuggestion = () => {
    if (!gameEngineRef.current) return '';
    return gameEngineRef.current.getCheckoutSuggestion(getCurrentScore());
  };

  // Show camera setup first
  if (!cameraSetupComplete) {
    return (
      <CameraSetup
        onReady={() => setCameraSetupComplete(true)}
        onSkip={() => setCameraSetupComplete(true)}
      />
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  // Toggle local camera
  const toggleLocalCamera = () => {
    const stream = webRTCService.getLocalStream();
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !localCameraEnabled;
        setLocalCameraEnabled(!localCameraEnabled);
      }
    }
  };

  // Get player display names
  const player1Name = gameState.players?.[gameState.match.player1_id]?.display_name || 'Player 1';
  const player2Name = gameState.players?.[gameState.match.player2_id]?.display_name || 'Player 2';
  const player1 = { name: player1Name, isMe: gameState.match.player1_id === user?.id };
  const player2 = { name: player2Name, isMe: gameState.match.player2_id === user?.id };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#111827] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white">
            ← Exit
          </button>
          <div>
            <h1 className="font-bold text-lg">Leg {gameState.currentLeg.leg_number} of {gameState.match.legs_to_win * 2 - 1}</h1>
            <p className="text-xs text-gray-500">{gameState.match.game_mode} • Best of {gameState.match.legs_to_win * 2 - 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800">
            <span className={`w-2 h-2 rounded-full ${
              connectionState === 'connected' ? 'bg-emerald-500 animate-pulse' : 
              connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></span>
            <span className="text-xs text-gray-400">
              {connectionState === 'connected' ? 'Connected' : 
               connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          
          {/* Camera Toggle */}
          <button
            onClick={toggleLocalCamera}
            className={`p-2 rounded-lg transition-colors ${
              localCameraEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
            title={localCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
          >
            {localCameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>
          
          {/* Screen Share (placeholder) */}
          <button
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Share screen"
            onClick={() => alert('Screen sharing coming soon!')}
          >
            <MonitorUp className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Camera Feed */}
        <div className="flex-1 bg-black relative">
          {/* Remote Camera (Big) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${!showRemoteCamera ? 'hidden' : ''}`}
          />
          
          {/* Placeholder when no remote video */}
          {!showRemoteCamera && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">📹</span>
                </div>
                <p className="text-gray-500">Waiting for opponent camera...</p>
              </div>
            </div>
          )}

          {/* Local Camera (Picture in Picture) */}
          <div className={`absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 ${
            localCameraEnabled ? 'border-emerald-500' : 'border-red-500'
          }`}>
            {localCameraEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <CameraOff className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <div className={`absolute top-1 left-1 text-xs px-1 rounded ${
              localCameraEnabled ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
              {localCameraEnabled ? 'You' : 'Camera Off'}
            </div>
          </div>

          {/* Turn Indicator Overlay */}
          {isMyTurn && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold px-4 py-2 rounded-full animate-pulse">
              YOUR TURN
            </div>
          )}
        </div>

        {/* Right: Scoreboard & Controls */}
        <div className="w-full lg:w-96 bg-[#111827] border-l border-gray-800 flex flex-col">
          {/* Scores */}
          <div className="p-4 border-b border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 */}
              <div className={`p-4 rounded-xl text-center ${gameState.currentPlayerId === gameState.match.player1_id ? 'bg-emerald-900/50 border-2 border-emerald-500' : 'bg-gray-800'}`}>
                <p className="text-sm text-gray-400 mb-1">{player1.isMe ? 'You' : 'Opponent'}</p>
                <p className="text-5xl font-bold mb-2">{gameState.player1Score}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">Legs: {gameState.match.player1_legs}</span>
                </div>
              </div>

              {/* Player 2 */}
              <div className={`p-4 rounded-xl text-center ${gameState.currentPlayerId === gameState.match.player2_id ? 'bg-emerald-900/50 border-2 border-emerald-500' : 'bg-gray-800'}`}>
                <p className="text-sm text-gray-400 mb-1">{player2.isMe ? 'You' : 'Opponent'}</p>
                <p className="text-5xl font-bold mb-2">{gameState.player2Score}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded">Legs: {gameState.match.player2_legs}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Suggestion */}
          {isMyTurn && getCheckoutSuggestion() && (
            <div className="px-4 py-2 bg-emerald-900/30 border-b border-emerald-900/50">
              <p className="text-xs text-emerald-400">Checkout: <span className="font-bold">{getCheckoutSuggestion()}</span></p>
            </div>
          )}

          {/* Current Visit Display */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Current Visit</span>
              <span className={`font-bold ${isBust() ? 'text-red-500' : 'text-emerald-400'}`}>
                {getVisitTotal()} / {getRemainingAfter()}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-16 rounded-lg flex flex-col items-center justify-center border-2 ${
                    activeDart === i && isMyTurn
                      ? 'border-emerald-500 bg-emerald-900/30'
                      : currentDarts[i]
                      ? 'border-gray-600 bg-gray-800'
                      : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  {currentDarts[i] ? (
                    <>
                      <span className="text-xs text-gray-500">Dart {i + 1}</span>
                      <span className="text-xl font-bold">
                        {currentDarts[i].multiplier === 3 ? 'T' : currentDarts[i].multiplier === 2 ? 'D' : ''}
                        {currentDarts[i].score}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-600">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Interface */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Number Selector Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-800">
              {(['20', '19', '18', '17', '16', '15', 'Bull'] as const).map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveTab(num)}
                  className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${
                    activeTab === num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                  disabled={!isMyTurn}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Scoring Buttons */}
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'Bull' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDartInput(25, 1)}
                    disabled={!isMyTurn || activeDart >= 3}
                    className="h-20 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 font-bold text-lg"
                  >
                    Outer Bull
                    <span className="block text-sm text-gray-500">25</span>
                  </button>
                  <button
                    onClick={() => handleDartInput(50, 1)}
                    disabled={!isMyTurn || activeDart >= 3}
                    className="h-20 rounded-xl bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 disabled:opacity-50 font-bold text-lg"
                  >
                    Bullseye
                    <span className="block text-sm text-red-400">50</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {/* Singles */}
                  <button
                    onClick={() => handleDartInput(parseInt(activeTab), 1)}
                    disabled={!isMyTurn || activeDart >= 3}
                    className="h-20 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 font-bold text-xl"
                  >
                    {activeTab}
                  </button>
                  {/* Double */}
                  <button
                    onClick={() => handleDartInput(parseInt(activeTab), 2)}
                    disabled={!isMyTurn || activeDart >= 3}
                    className="h-20 rounded-xl bg-emerald-900/30 border border-emerald-500/50 hover:bg-emerald-900/50 disabled:opacity-50 font-bold text-xl"
                  >
                    D{activeTab}
                    <span className="block text-xs text-emerald-400">{parseInt(activeTab) * 2}</span>
                  </button>
                  {/* Treble */}
                  <button
                    onClick={() => handleDartInput(parseInt(activeTab), 3)}
                    disabled={!isMyTurn || activeDart >= 3}
                    className="h-20 rounded-xl bg-amber-900/30 border border-amber-500/50 hover:bg-amber-900/50 disabled:opacity-50 font-bold text-xl"
                  >
                    T{activeTab}
                    <span className="block text-xs text-amber-400">{parseInt(activeTab) * 3}</span>
                  </button>
                  {/* Miss */}
                  <button
                    onClick={() => handleDartInput(0, 1)}
                    disabled={!isMyTurn || activeDart >= 3}
                    className="h-20 rounded-xl bg-gray-900 border border-gray-700 hover:bg-gray-800 disabled:opacity-50 font-bold col-span-3"
                  >
                    Miss
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-800 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={!isMyTurn || activeDart === 0}
                  className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 font-bold"
                >
                  Undo
                </button>
                <button
                  onClick={handleClear}
                  disabled={!isMyTurn || currentDarts.length === 0}
                  className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 font-bold"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isMyTurn || currentDarts.length === 0}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-gray-800 font-bold text-xl transition-all"
              >
                {isBust() ? 'BUST - Submit 0' : `Submit ${getVisitTotal()}`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
