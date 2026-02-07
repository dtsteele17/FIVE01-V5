// ============================================
// FIVE01 Darts - Training Game Modes
// ============================================

// Training modes - no Supabase dependency for offline play

// ============================================
// FINISH TRAINING
// ============================================

export interface FinishTrainingSession {
  id: string;
  userId: string;
  minCheckout: number;
  maxCheckout: number;
  attemptsPerNumber: number;
  startTime: string;
  endTime?: string;
  completed: boolean;
}

export interface FinishAttempt {
  id: string;
  sessionId: string;
  targetNumber: number;
  attemptNumber: number;
  darts: DartThrow[];
  successful: boolean;
  completedAt: string;
}

export interface DartThrow {
  score: number;
  multiplier: 1 | 2 | 3;
  segment: string;
}

// Valid checkout paths for numbers 2-170
const CHECKOUT_PATHS: Record<number, string[]> = {
  // Common checkouts (2-40)
  40: ['D20'], 38: ['D19'], 36: ['D18'], 34: ['D17'], 32: ['D16'],
  30: ['D15'], 28: ['D14'], 26: ['D13'], 24: ['D12'], 22: ['D11'],
  20: ['D10'], 18: ['D9'], 16: ['D8'], 14: ['D7'], 12: ['D6'],
  10: ['D5'], 8: ['D4'], 6: ['D3'], 4: ['D2'], 2: ['D1'],
  39: ['S7 D16', 'S19 D10'], 37: ['S5 D16', 'S17 D10'],
  35: ['S3 D16', 'S15 D10'], 33: ['S1 D16', 'S13 D10'],
  31: ['S15 D8', 'S7 D12'], 29: ['S13 D8', 'S5 D12'],
  27: ['S11 D8', 'S19 D4'], 25: ['S17 D4', 'S9 D8'],
  23: ['S7 D8', 'S3 D10'], 21: ['S5 D8', 'S17 D2'],
  19: ['S3 D8', 'S11 D4'], 17: ['S1 D8', 'S9 D4'],
  15: ['S7 D4', 'S13 D1'], 13: ['S5 D4', 'S9 D2'],
  11: ['S3 D4', 'S7 D2'], 9: ['S1 D4', 'S5 D2'],
  7: ['S3 D2', 'S5 D1'], 5: ['S1 D2', 'S3 D1'],
  3: ['S1 D1'],
  
  // Higher checkouts
  50: ['BULL', 'S10 D20', 'S20 D15'],
  51: ['S11 D20', 'S19 D16'],
  52: ['S12 D20', 'S20 D16'],
  60: ['S20 D20', 'T20'],
  64: ['S16 D24', 'T16 D8'],
  68: ['S20 D24', 'T20 D4'],
  70: ['S20 D25', 'T20 D5'],
  72: ['S20 D26', 'T20 D6'],
  74: ['S14 D30', 'T14 D16'],
  76: ['S20 D28', 'T20 D8'],
  78: ['S18 D30', 'T18 D12'],
  80: ['S20 D30', 'T20 D10'],
  82: ['S14 D34', 'T14 D20'],
  84: ['S14 D35', 'T16 D18'],
  86: ['S18 D34', 'T18 D16'],
  88: ['S20 D34', 'T20 D14'],
  90: ['S20 D35', 'T20 D15'],
  92: ['S20 D36', 'T20 D16'],
  94: ['S14 D40', 'T18 D20'],
  96: ['S20 D38', 'T20 D18'],
  98: ['S20 D39', 'T20 D19'],
  100: ['S20 D40', 'T20 D20', 'BULL D25'],
  101: ['S1 T20 D20', 'T17 D25'],
  102: ['S19 T20 D20', 'T20 D21', 'BULL D26'],
  103: ['S3 T20 D20', 'T19 D23'],
  104: ['S18 T20 D20', 'T18 D25'],
  105: ['S15 T20 D20', 'T20 D22', 'T19 D24'],
  106: ['S10 T20 D20', 'T20 D23'],
  107: ['S19 T18 D20', 'T19 D25'],
  108: ['S18 T20 D20', 'T20 D24', 'T19 D25', 'T18 D27'],
  109: ['S19 T20 D20', 'T20 D24', 'T19 D26'],
  110: ['S20 T20 D20', 'T20 D25', 'BULL D30'],
  111: ['T20 T17 D20', 'T19 T16 D20'],
  112: ['T18 T18 D20', 'T20 D26'],
  113: ['S13 T20 D20', 'T20 D26', 'T19 T16 D20'],
  114: ['S14 T20 D20', 'T20 D27', 'T18 D30'],
  115: ['S15 T20 D20', 'S19 T18 D20', 'T20 D27'],
  116: ['S16 T20 D20', 'T20 D28'],
  117: ['S17 T20 D20', 'T19 D30', 'T18 T19 D12'],
  118: ['S18 T20 D20', 'T20 D29', 'T18 D32'],
  119: ['S19 T20 D20', 'T19 D31', 'T18 D32', 'T17 T16 D18'],
  120: ['T20 20 D20', 'T19 T19 D12', 'T20 D30', 'T17 25 D16'],
  121: ['T20 T15 D18', 'T19 T12 D20', 'T17 T16 D20'],
  122: ['T18 T20 D13', 'T20 T14 D20', 'S20 T18 D20'],
  123: ['T20 T13 D18', 'T19 T16 D18', 'T19 T14 D20'],
  124: ['T20 T14 D20', 'T20 T16 D18', 'T18 18 D20'],
  125: ['S25 T20 D20', 'T20 T19 D14', 'T20 25 D20', 'T19 T16 D20'],
  126: ['T19 19 D20', 'T20 T16 D18', 'T18 18 D20', 'T20 T18 D16'],
  127: ['T20 T17 D18', 'T20 T14 D20', 'T19 T18 D17'],
  128: ['T20 T20 D14', 'T18 T18 D19', 'T20 T12 D22', 'T18 14 D20'],
  129: ['T19 T20 D16', 'T19 T16 D20', 'T17 T20 D19'],
  130: ['T20 T20 D15', 'T20 20 D25', 'T18 T16 D20'],
  131: ['T20 T15 D18', 'T20 T17 D20', 'BULL T15 D18', 'T19 14 D20'],
  132: ['T20 T16 D18', 'T17 T15 D20', 'T18 T18 D18'],
  133: ['T20 T19 D18', 'T20 T15 D20', 'T17 T18 D18', 'T19 16 D20'],
  134: ['T20 T14 D20', 'T20 T18 D20', 'T18 T16 D20', 'T19 19 D20'],
  135: ['BULL T20 D20', 'T20 T17 D18', 'T20 25 D20', 'T19 T20 D19'],
  136: ['T20 T20 D18', 'T18 T20 D20', 'BULL T18 D20', 'T19 T19 D20'],
  137: ['T20 T15 D20', 'T19 T20 D20', 'T17 T16 D20', 'T20 T19 D20'],
  138: ['T20 T18 D18', 'T20 T14 D22', 'T18 T16 D22', 'T19 T19 D21'],
  139: ['T20 T13 D20', 'T19 T14 D20', 'T17 T20 D24', 'T20 T17 D24'],
  140: ['T20 T20 D20', 'T18 T18 D25', 'T20 T16 D24', 'BULL T20 D25'],
  141: ['T20 T15 D20', 'T20 T19 D22', 'T19 T16 D26', 'T17 T16 D30'],
  142: ['T20 T14 D20', 'T20 T18 D23', 'T19 T15 D26', 'T18 T18 D26'],
  143: ['T20 T17 D20', 'T19 T18 D25', 'T20 T13 D28', 'T19 T14 D30'],
  144: ['T20 T20 D22', 'T18 T18 D27', 'T19 T19 D25', 'T20 T16 D28'],
  145: ['T20 T15 D20', 'T20 T19 D24', 'T19 T20 D24', 'T18 T17 D28'],
  146: ['T20 T18 D26', 'T20 T14 D28', 'T19 T19 D26', 'T18 T16 D31'],
  147: ['T20 T17 D28', 'T20 T13 D30', 'T19 T18 D27', 'T17 T16 D35'],
  148: ['T20 T20 D24', 'T20 T16 D30', 'T18 T18 D29', 'T19 T17 D30'],
  149: ['T20 T19 D26', 'T20 T15 D32', 'T19 T20 D26', 'T17 T20 D29'],
  150: ['T20 T18 D28', 'T20 T20 D25', 'BULL T20 D30', 'T19 T19 D27'],
  151: ['T20 T17 D30', 'T20 T13 D35', 'T19 T18 D30', 'T17 T18 D32'],
  152: ['T20 T20 D26', 'T20 T16 D32', 'T18 T20 D28', 'T19 T15 D35'],
  153: ['T20 T19 D28', 'T20 T15 D34', 'T19 T20 D28', 'T18 T17 D33'],
  154: ['T20 T18 D30', 'T20 T14 D35', 'T18 T20 D29', 'T19 T19 D29'],
  155: ['T20 T19 D29', 'T20 T15 D35', 'T19 T16 D34', 'T17 T20 D32'],
  156: ['T20 T20 D28', 'T20 T16 D36', 'T18 T18 D33', 'T19 T19 D30'],
  157: ['T20 T19 D30', 'T20 T15 D36', 'T19 T20 D30', 'T17 T18 D35'],
  158: ['T20 T20 D29', 'T20 T18 D32', 'T18 T20 D31', 'T19 T17 D35'],
  159: ['T20 T19 D31', 'T20 T15 D37', 'T19 T16 D36', 'T17 T16 D39'],
  160: ['T20 T20 D30', 'T20 T16 D38', 'T18 T18 D35', 'T19 T19 D31'],
  161: ['T20 T17 D35', 'T20 T13 D40', 'T19 T20 D32', 'T17 T18 D37'],
  162: ['T20 T20 D31', 'T20 T14 D40', 'T18 T20 D33', 'T19 T15 D40'],
  163: ['T20 T19 D33', 'T20 T17 D36', 'T19 T18 D35', 'T17 T16 D42'],
  164: ['T20 T18 D35', 'T20 T14 D41', 'T18 T20 D34', 'T19 T19 D33'],
  165: ['T20 T19 D34', 'T20 T15 D40', 'T19 T16 D40', 'T17 T20 D37'],
  166: ['T20 T20 D33', 'T20 T16 D41', 'T18 T18 D38', 'T19 T19 D35'],
  167: ['T20 T19 D35', 'T20 T20 D33', 'T19 T20 D34', 'T17 T18 D40'],
  168: ['T20 T20 D34', 'T20 T16 D42', 'T18 T20 D37', 'T19 T17 D40'],
  169: ['T20 T19 D36', 'T20 T17 D39', 'T19 T18 D38', 'T17 T20 D39'],
  170: ['T20 T20 D25', 'T20 T20 BULL', 'T20 T20 DB'],
};

class FinishTrainingService {
  private currentSession: FinishTrainingSession | null = null;
  private attempts: FinishAttempt[] = [];
  private currentTarget: number = 0;
  private currentAttemptNumber: number = 1;
  private generatedTargets: number[] = [];

  startSession(minCheckout: number, maxCheckout: number, attemptsPerNumber: number = 3): FinishTrainingSession {
    const session: FinishTrainingSession = {
      id: crypto.randomUUID(),
      userId: '', // Will be set from auth
      minCheckout,
      maxCheckout,
      attemptsPerNumber,
      startTime: new Date().toISOString(),
      completed: false,
    };

    this.currentSession = session;
    this.attempts = [];
    this.generatedTargets = [];
    this.currentAttemptNumber = 1;
    
    // Generate first target
    this.currentTarget = this.generateNewTarget();

    return session;
  }

  private generateNewTarget(): number {
    const { minCheckout, maxCheckout } = this.currentSession!;
    let target: number;
    
    do {
      target = Math.floor(Math.random() * (maxCheckout - minCheckout + 1)) + minCheckout;
    } while (this.generatedTargets.includes(target));
    
    // If all targets used, reset
    if (this.generatedTargets.length >= (maxCheckout - minCheckout + 1)) {
      this.generatedTargets = [];
    }
    
    this.generatedTargets.push(target);
    this.currentAttemptNumber = 1;
    return target;
  }

  recordAttempt(darts: DartThrow[]): { success: boolean; completed: boolean; nextTarget?: number; message?: string } {
    if (!this.currentSession) throw new Error('No active session');

    const totalScore = darts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);
    const success = totalScore === this.currentTarget;
    const bust = totalScore > this.currentTarget || (this.currentTarget - totalScore === 1);

    const attempt: FinishAttempt = {
      id: crypto.randomUUID(),
      sessionId: this.currentSession.id,
      targetNumber: this.currentTarget,
      attemptNumber: this.currentAttemptNumber,
      darts,
      successful: success && !bust,
      completedAt: new Date().toISOString(),
    };

    this.attempts.push(attempt);
    this.currentAttemptNumber++;

    // Check if we need to move to next target
    const moveToNextTarget = this.currentAttemptNumber > this.currentSession.attemptsPerNumber;
    
    let nextTarget: number | undefined;
    let message: string | undefined;
    
    if (moveToNextTarget) {
      nextTarget = this.generateNewTarget();
      this.currentTarget = nextTarget;
      message = `Moving to ${nextTarget}. Try these checkouts: ${CHECKOUT_PATHS[nextTarget]?.slice(0, 2).join(' or ')}`;
    } else {
      message = `Attempt ${this.currentAttemptNumber}/${this.currentSession.attemptsPerNumber} on ${this.currentTarget}`;
    }

    // Check if session complete (let's say 10 unique numbers)
    const completed = this.generatedTargets.length >= 10;

    return {
      success: attempt.successful,
      completed,
      nextTarget,
      message,
    };
  }

  getCurrentTarget(): number {
    return this.currentTarget;
  }

  getCurrentAttemptNumber(): number {
    return this.currentAttemptNumber;
  }

  getAttemptsPerNumber(): number {
    return this.currentSession?.attemptsPerNumber || 3;
  }

  getSuggestedCheckouts(score: number): string[] {
    return CHECKOUT_PATHS[score] || ['No checkout available'];
  }

  getStats() {
    const totalAttempts = this.attempts.length;
    const successfulAttempts = this.attempts.filter(a => a.successful).length;
    const byTarget: Record<number, { attempts: number; successes: number }> = {};

    this.attempts.forEach(attempt => {
      if (!byTarget[attempt.targetNumber]) {
        byTarget[attempt.targetNumber] = { attempts: 0, successes: 0 };
      }
      byTarget[attempt.targetNumber].attempts++;
      if (attempt.successful) {
        byTarget[attempt.targetNumber].successes++;
      }
    });

    return {
      totalAttempts,
      successfulAttempts,
      successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0,
      byTarget,
      targetsCompleted: Object.keys(byTarget).length,
    };
  }

  endSession(): FinishTrainingSession {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.currentSession.completed = true;
    }
    return this.currentSession!;
  }
}

// ============================================
// AROUND THE CLOCK
// ============================================

export type AroundTheClockMode = 'standard' | 'doubles' | 'triples' | 'mixed';

export interface AroundTheClockGame {
  id: string;
  mode: AroundTheClockMode;
  players: AroundTheClockPlayer[];
  currentPlayerIndex: number;
  currentTarget: number;
  winner?: string;
  startTime: string;
  endTime?: string;
}

export interface AroundTheClockPlayer {
  id: string;
  name: string;
  currentNumber: number;
  dartsThrown: number;
  completed: boolean;
}

class AroundTheClockService {
  private currentGame: AroundTheClockGame | null = null;

  startGame(mode: AroundTheClockMode = 'standard', playerName: string = 'Player'): AroundTheClockGame {
    const game: AroundTheClockGame = {
      id: crypto.randomUUID(),
      mode,
      players: [{
        id: 'player',
        name: playerName,
        currentNumber: 1,
        dartsThrown: 0,
        completed: false,
      }],
      currentPlayerIndex: 0,
      currentTarget: 1,
      startTime: new Date().toISOString(),
    };

    this.currentGame = game;
    return game;
  }

  recordHit(segment: string): { hit: boolean; advanced: boolean; completed: boolean; message: string } {
    if (!this.currentGame) throw new Error('No active game');

    const player = this.currentGame.players[this.currentGame.currentPlayerIndex];
    const mode = this.currentGame.mode;

    let hit = false;
    let targetMultiplier = 1;
    
    switch (mode) {
      case 'doubles':
        targetMultiplier = 2;
        break;
      case 'triples':
        targetMultiplier = 3;
        break;
      case 'mixed':
        // Mixed: 1-6 singles, 7-13 doubles, 14-20 triples
        if (player.currentNumber >= 14) targetMultiplier = 3;
        else if (player.currentNumber >= 7) targetMultiplier = 2;
        break;
      default:
        targetMultiplier = 1;
    }

    // Parse segment
    const isDouble = segment.startsWith('D');
    const isTriple = segment.startsWith('T');
    const isBull = segment === 'BULL' || segment === 'OUTER';
    const score = isBull ? 50 : parseInt(segment.replace(/[STD]/, '')) || 0;
    const multiplier = isTriple ? 3 : isDouble ? 2 : isBull ? 1 : 1;

    // Check if hit target
    if (score === player.currentNumber && multiplier >= targetMultiplier) {
      hit = true;
      player.currentNumber++;
      
      if (player.currentNumber > 20) {
        player.completed = true;
        this.currentGame.winner = player.id;
        this.currentGame.endTime = new Date().toISOString();
      }
    }

    player.dartsThrown++;
    this.currentGame.currentTarget = player.currentNumber;

    const message = hit
      ? player.completed
        ? '🎉 Around the Clock Complete!'
        : `Hit! Next: ${mode === 'doubles' ? 'D' : mode === 'triples' ? 'T' : ''}${player.currentNumber}`
      : `Miss! Still need ${mode === 'doubles' ? 'D' : mode === 'triples' ? 'T' : ''}${player.currentNumber}`;

    return {
      hit,
      advanced: hit,
      completed: player.completed,
      message,
    };
  }

  getCurrentGame(): AroundTheClockGame | null {
    return this.currentGame;
  }

  getStats() {
    if (!this.currentGame) return null;
    
    const player = this.currentGame.players[0];
    return {
      numbersHit: player.currentNumber - 1,
      totalDarts: player.dartsThrown,
      averageDartsPerNumber: player.dartsThrown > 0 ? (player.dartsThrown / (player.currentNumber - 1)).toFixed(1) : '0',
      remaining: 20 - (player.currentNumber - 1),
    };
  }
}

// ============================================
// JDC CHALLENGE
// ============================================

export interface JDCChallengeGame {
  id: string;
  playerName: string;
  scores: Record<number, JDCRoundScore>;
  currentRound: number;
  totalScore: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
}

export interface JDCRoundScore {
  target: string;
  darts: DartThrow[];
  score: number;
  bonus: number; // Doubles bonus
  total: number;
}

class JDCChallengeService {
  private currentGame: JDCChallengeGame | null = null;

  // JDC Challenge targets
  private targets = [
    { round: 1, target: '10', description: '10s' },
    { round: 2, target: '11', description: '11s' },
    { round: 3, target: '12', description: '12s' },
    { round: 4, target: '13', description: '13s' },
    { round: 5, target: '14', description: '14s' },
    { round: 6, target: '15', description: '15s' },
    { round: 7, target: 'T10', description: 'T10s' },
    { round: 8, target: 'T11', description: 'T11s' },
    { round: 9, target: 'T12', description: 'T12s' },
    { round: 10, target: 'T13', description: 'T13s' },
    { round: 11, target: 'T14', description: 'T14s' },
    { round: 12, target: 'T15', description: 'T15s' },
    { round: 13, target: 'D', description: 'Doubles (any)' },
    { round: 14, target: 'DB', description: 'Double Bull' },
  ];

  startGame(playerName: string = 'Player'): JDCChallengeGame {
    const game: JDCChallengeGame = {
      id: crypto.randomUUID(),
      playerName,
      scores: {},
      currentRound: 1,
      totalScore: 0,
      completed: false,
      startTime: new Date().toISOString(),
    };

    this.currentGame = game;
    return game;
  }

  recordRound(darts: DartThrow[]): { score: number; bonus: number; total: number; completed: boolean } {
    if (!this.currentGame) throw new Error('No active game');

    const targetInfo = this.targets[this.currentGame.currentRound - 1];
    let score = 0;
    let bonus = 0;

    darts.forEach(dart => {
      const isTargetHit = this.isTargetHit(dart, targetInfo.target);
      
      if (isTargetHit) {
        score += dart.score * dart.multiplier;
        
        // Bonus for doubles
        if (targetInfo.target !== 'DB' && dart.multiplier === 2) {
          bonus += 1;
        }
      }
    });

    const total = score + bonus;

    this.currentGame.scores[this.currentGame.currentRound] = {
      target: targetInfo.target,
      darts,
      score,
      bonus,
      total,
    };

    this.currentGame.totalScore += total;
    this.currentGame.currentRound++;

    if (this.currentGame.currentRound > this.targets.length) {
      this.currentGame.completed = true;
      this.currentGame.endTime = new Date().toISOString();
    }

    return { score, bonus, total, completed: this.currentGame.completed };
  }

  private isTargetHit(dart: DartThrow, target: string): boolean {
    switch (target) {
      case 'D':
        return dart.multiplier === 2;
      case 'DB':
        return dart.segment === 'BULL';
      default:
        if (target.startsWith('T')) {
          const num = parseInt(target.replace('T', ''));
          return dart.score === num && dart.multiplier === 3;
        }
        return dart.score === parseInt(target);
    }
  }

  getCurrentRound() {
    if (!this.currentGame) return null;
    return this.targets[this.currentGame.currentRound - 1];
  }

  getStats() {
    if (!this.currentGame) return null;

    const rounds = Object.values(this.currentGame.scores);
    const completedRounds = rounds.length;
    
    return {
      totalScore: this.currentGame.totalScore,
      roundsCompleted: completedRounds,
      roundsRemaining: this.targets.length - completedRounds,
      averagePerRound: completedRounds > 0 ? (this.currentGame.totalScore / completedRounds).toFixed(1) : '0',
      highestRound: rounds.length > 0 ? Math.max(...rounds.map(r => r.total)) : 0,
      totalBonus: rounds.reduce((sum, r) => sum + r.bonus, 0),
    };
  }

  getGrade(score: number): { grade: string; color: string } {
    if (score >= 500) return { grade: 'Professional', color: 'text-purple-400' };
    if (score >= 400) return { grade: 'Advanced', color: 'text-blue-400' };
    if (score >= 300) return { grade: 'Intermediate', color: 'text-green-400' };
    if (score >= 200) return { grade: 'Beginner', color: 'text-yellow-400' };
    return { grade: 'Novice', color: 'text-gray-400' };
  }
}

// ============================================
// BOB'S 27
// ============================================

export interface Bobs27Game {
  id: string;
  playerName: string;
  currentTarget: number;
  score: number;
  lives: number;
  completed: boolean;
  startTime: string;
  endTime?: string;
  history: Bobs27Round[];
}

export interface Bobs27Round {
  target: number;
  hits: number;
  pointsScored: number;
  pointsLost: number;
  netResult: number;
}

class Bobs27Service {
  private currentGame: Bobs27Game | null = null;

  startGame(playerName: string = 'Player'): Bobs27Game {
    const game: Bobs27Game = {
      id: crypto.randomUUID(),
      playerName,
      currentTarget: 1,
      score: 27,
      lives: 3,
      completed: false,
      startTime: new Date().toISOString(),
      history: [],
    };

    this.currentGame = game;
    return game;
  }

  recordRound(darts: DartThrow[]): { 
    hits: number; 
    pointsScored: number; 
    pointsLost: number; 
    netResult: number; 
    gameOver: boolean; 
    completed: boolean;
    message: string;
  } {
    if (!this.currentGame) throw new Error('No active game');
    if (this.currentGame.completed || this.currentGame.lives <= 0) {
      return { hits: 0, pointsScored: 0, pointsLost: 0, netResult: 0, gameOver: true, completed: true, message: 'Game Over!' };
    }

    const target = this.currentGame.currentTarget;
    let hits = 0;

    darts.forEach(dart => {
      if (dart.score === target) {
        hits += dart.multiplier;
      }
    });

    const pointsScored = hits * target;
    const pointsLost = (3 - hits) * target;
    const netResult = pointsScored - pointsLost;

    this.currentGame.score += netResult;
    
    const round: Bobs27Round = {
      target,
      hits,
      pointsScored,
      pointsLost,
      netResult,
    };
    this.currentGame.history.push(round);

    // Check for game over (lose all points or all lives)
    if (this.currentGame.score <= 0) {
      this.currentGame.lives--;
      if (this.currentGame.lives <= 0) {
        this.currentGame.completed = true;
        this.currentGame.endTime = new Date().toISOString();
      } else {
        this.currentGame.score = 27; // Reset score but keep going
      }
    }

    this.currentGame.currentTarget++;

    // Complete at 20
    if (this.currentGame.currentTarget > 20) {
      this.currentGame.completed = true;
      this.currentGame.endTime = new Date().toISOString();
    }

    const gameOver = this.currentGame.lives <= 0;
    const completed = this.currentGame.completed;

    let message = '';
    if (completed && !gameOver) {
      message = `🎉 Bob's 27 Complete! Final Score: ${this.currentGame.score}`;
    } else if (gameOver) {
      message = '💔 Game Over! No lives remaining.';
    } else if (this.currentGame.score <= 0) {
      message = `Lost a life! ${this.currentGame.lives} remaining. Score reset to 27.`;
    } else {
      message = `${hits}/3 hits on ${target}. Net: ${netResult > 0 ? '+' : ''}${netResult}`;
    }

    return {
      hits,
      pointsScored,
      pointsLost,
      netResult,
      gameOver,
      completed,
      message,
    };
  }

  getCurrentGame(): Bobs27Game | null {
    return this.currentGame;
  }

  getStats() {
    if (!this.currentGame) return null;

    const history = this.currentGame.history;
    const totalHits = history.reduce((sum, r) => sum + r.hits, 0);
    const totalDarts = history.length * 3;

    return {
      currentScore: this.currentGame.score,
      currentTarget: this.currentGame.currentTarget,
      livesRemaining: this.currentGame.lives,
      roundsCompleted: history.length,
      totalHits,
      accuracy: totalDarts > 0 ? ((totalHits / totalDarts) * 100).toFixed(1) : '0',
      maxStreak: this.calculateMaxStreak(),
    };
  }

  private calculateMaxStreak(): number {
    if (!this.currentGame) return 0;
    
    let maxStreak = 0;
    let currentStreak = 0;

    this.currentGame.history.forEach(round => {
      if (round.hits > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  }

  getGrade(score: number): { grade: string; color: string } {
    if (score >= 1000) return { grade: 'Expert', color: 'text-purple-400' };
    if (score >= 700) return { grade: 'Advanced', color: 'text-blue-400' };
    if (score >= 500) return { grade: 'Intermediate', color: 'text-green-400' };
    if (score >= 300) return { grade: 'Beginner', color: 'text-yellow-400' };
    return { grade: 'Novice', color: 'text-gray-400' };
  }
}

// ============================================
// EXPORT SERVICES
// ============================================

export const finishTrainingService = new FinishTrainingService();
export const aroundTheClockService = new AroundTheClockService();
export const jdcChallengeService = new JDCChallengeService();
export const bobs27Service = new Bobs27Service();

export const trainingService = {
  finishTraining: finishTrainingService,
  aroundTheClock: aroundTheClockService,
  jdcChallenge: jdcChallengeService,
  bobs27: bobs27Service,
};

export default trainingService;
