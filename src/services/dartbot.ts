// ============================================
// FIVE01 Darts - Advanced DartBot AI
// ============================================

export type DartBotLevel = 25 | 35 | 45 | 55 | 65 | 75 | 85 | 95;

interface DartThrow {
  score: number;
  multiplier: 1 | 2 | 3;
  segment: string; // e.g., "T20", "S5", "D10", "BULL", "OUTER"
}

interface BoardPosition {
  x: number;
  y: number;
  angle: number;
  distance: number;
}

// Segment positions on the dartboard (simplified polar coordinates)
const SEGMENT_ANGLES: Record<number, number> = {
  20: 0, 1: 18, 18: 36, 4: 54, 13: 72, 6: 90, 10: 108, 15: 126,
  2: 144, 17: 162, 3: 180, 19: 198, 7: 216, 16: 234, 8: 252,
  11: 270, 14: 288, 9: 306, 12: 324, 5: 342
};



export class DartBot {
  private level: DartBotLevel;
  private baseAccuracy: number;

  private recentAverages: number[] = [];

  constructor(level: DartBotLevel) {
    this.level = level;
    // Calculate base accuracy based on level
    // Level 25 = ~60% accuracy, Level 95 = ~95% accuracy
    this.baseAccuracy = 0.55 + (level / 100) * 0.4;
    // Higher level = less variance

  }

  getLevel(): DartBotLevel {
    return this.level;
  }

  getExpectedAverage(): number {
    return this.level;
  }

  // Generate a visit (3 darts) based on remaining score
  generateVisit(remainingScore: number): { darts: DartThrow[]; total: number; positions: BoardPosition[] } {
    const darts: DartThrow[] = [];
    const positions: BoardPosition[] = [];
    let currentRemaining = remainingScore;

    for (let i = 0; i < 3; i++) {
      // Decide what to aim for
      const target = this.decideTarget(currentRemaining);
      
      // Throw the dart with realistic physics
      const { dart, position } = this.throwDart(target);
      
      darts.push(dart);
      positions.push(position);

      // Update remaining score
      if (!this.isBust(currentRemaining, dart)) {
        currentRemaining -= (dart.score * dart.multiplier);
      }

      // Stop if checkout achieved
      if (currentRemaining === 0) break;
    }

    const total = darts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);
    
    // Track for averaging
    this.recentAverages.push(total);
    if (this.recentAverages.length > 10) {
      this.recentAverages.shift();
    }

    return { darts, total, positions };
}

  // Decide what target to aim for based on remaining score
  private decideTarget(remaining: number): { score: number; multiplier: 1 | 2 | 3; segment: string } {
    // Checkout logic
    if (remaining <= 170) {
      const checkout = this.getCheckoutPath(remaining);
      if (checkout) {
        return checkout;
      }
    }

    // Setup for checkout
    if (remaining <= 100 && remaining > 60) {
      // Aim for a number that leaves a nice checkout
      if (remaining - 60 <= 40 && remaining - 60 >= 2) {
        return { score: 20, multiplier: 3, segment: 'T20' }; // 60 leaves double
      }
      if (remaining - 57 <= 40 && remaining - 57 >= 2) {
        return { score: 19, multiplier: 3, segment: 'T19' }; // 57 leaves double
      }
    }

    // If remaining is odd, try to make it even with a single
    if (remaining % 2 === 1 && remaining > 50) {
      return { score: 1, multiplier: 1, segment: 'S1' };
    }

    // Default: Aim for T20, but vary based on level
    const targets: Array<{score: number; multiplier: 1 | 2 | 3; segment: string; weight: number}> = [
      { score: 20, multiplier: 3, segment: 'T20', weight: 40 },
      { score: 19, multiplier: 3, segment: 'T19', weight: 25 },
      { score: 18, multiplier: 3, segment: 'T18', weight: 15 },
      { score: 14, multiplier: 3, segment: 'T14', weight: 10 },
      { score: 13, multiplier: 3, segment: 'T13', weight: 10 },
    ];

    // Higher level bots are more consistent with T20
    if (this.level >= 75) {
      targets[0].weight = 70;
      targets[1].weight = 15;
      targets[2].weight = 10;
      targets[3].weight = 3;
      targets[4].weight = 2;
    }

    return this.weightedRandom(targets);
  }

  // Get checkout path for a score
  private getCheckoutPath(remaining: number): { score: number; multiplier: 1 | 2 | 3; segment: string } | null {
    const checkouts: Record<number, { score: number; multiplier: 1 | 2 | 3; segment: string }> = {
      170: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 DB
      167: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 DB
      164: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T18 DB
      161: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T17 DB
      160: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D20
      158: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D19
      157: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 D20
      156: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D18
      155: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 D19
      154: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T18 D20
      153: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 D18
      152: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D16
      151: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T17 D20
      150: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T18 D18
      149: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 D16
      148: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T16 D20
      147: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T17 D18
      146: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T18 D16
      145: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T15 D20
      144: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D12
      143: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T17 D16
      142: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T14 D20
      141: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T15 D18
      140: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D10
      139: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T13 D20
      138: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T18 D12
      137: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 D10
      136: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D8
      135: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T17 D12
      134: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T14 D16
      133: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T19 D8
      132: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T16 D12
      131: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T13 D16
      130: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T20 D5
      129: { score: 19, multiplier: 3, segment: 'T19' }, // T19 T20 D6
      128: { score: 18, multiplier: 3, segment: 'T18' }, // T18 T20 D7
      127: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T17 D8
      126: { score: 19, multiplier: 3, segment: 'T19' }, // T19 T19 D6
      125: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T15 D10
      124: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T16 D8
      123: { score: 19, multiplier: 3, segment: 'T19' }, // T19 T16 D9
      122: { score: 18, multiplier: 3, segment: 'T18' }, // T18 T20 D13
      121: { score: 20, multiplier: 3, segment: 'T20' }, // T20 T11 D14
      120: { score: 20, multiplier: 3, segment: 'T20' }, // T20 20 D20
      119: { score: 19, multiplier: 3, segment: 'T19' }, // T19 20 D20
      118: { score: 20, multiplier: 3, segment: 'T20' }, // T20 18 D20
      117: { score: 20, multiplier: 3, segment: 'T20' }, // T20 17 D20
      116: { score: 20, multiplier: 3, segment: 'T20' }, // T20 16 D20
      115: { score: 20, multiplier: 3, segment: 'T20' }, // T20 15 D20
      114: { score: 20, multiplier: 3, segment: 'T20' }, // T20 14 D20
      113: { score: 20, multiplier: 3, segment: 'T20' }, // T20 13 D20
      112: { score: 20, multiplier: 3, segment: 'T20' }, // T20 12 D20
      111: { score: 20, multiplier: 3, segment: 'T20' }, // T20 11 D20
      110: { score: 20, multiplier: 3, segment: 'T20' }, // T20 10 D20
      109: { score: 20, multiplier: 3, segment: 'T20' }, // T20 9 D20
      108: { score: 20, multiplier: 3, segment: 'T20' }, // T20 8 D20
      107: { score: 19, multiplier: 3, segment: 'T19' }, // T19 18 D16
      106: { score: 20, multiplier: 3, segment: 'T20' }, // T20 6 D20
      105: { score: 20, multiplier: 3, segment: 'T20' }, // T20 5 D20
      104: { score: 18, multiplier: 3, segment: 'T18' }, // T18 18 D16
      103: { score: 19, multiplier: 3, segment: 'T19' }, // T19 10 D16
      102: { score: 20, multiplier: 3, segment: 'T20' }, // T20 2 D20
      101: { score: 17, multiplier: 3, segment: 'T17' }, // T17 10 D20
      100: { score: 20, multiplier: 3, segment: 'T20' }, // T20 D20
      99: { score: 19, multiplier: 3, segment: 'T19' },  // T19 10 D16
      98: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D19
      97: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D20
      96: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D18
      95: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D19
      94: { score: 18, multiplier: 3, segment: 'T18' },  // T18 D20
      93: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D18
      92: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D16
      91: { score: 17, multiplier: 3, segment: 'T17' },  // T17 D20
      90: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D15
      89: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D16
      88: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D14
      87: { score: 17, multiplier: 3, segment: 'T17' },  // T17 D18
      86: { score: 18, multiplier: 3, segment: 'T18' },  // T18 D16
      85: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D14
      84: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D12
      83: { score: 17, multiplier: 3, segment: 'T17' },  // T17 D16
      82: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D11
      81: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D12
      80: { score: 20, multiplier: 2, segment: 'D20' },  // D20
      79: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D11
      78: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D9
      77: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D10
      76: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D8
      75: { score: 15, multiplier: 3, segment: 'T15' },  // T15 D15
      74: { score: 14, multiplier: 3, segment: 'T14' },  // T14 D16
      73: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D8
      72: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D6
      71: { score: 13, multiplier: 3, segment: 'T13' },  // T13 D16
      70: { score: 20, multiplier: 2, segment: 'D20' },  // T10 D20
      69: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D6
      68: { score: 20, multiplier: 3, segment: 'T20' },  // T20 D4
      67: { score: 17, multiplier: 3, segment: 'T17' },  // T17 D8
      66: { score: 10, multiplier: 3, segment: 'T10' },  // T10 D18
      65: { score: 19, multiplier: 3, segment: 'T19' },  // T19 D4
      64: { score: 16, multiplier: 3, segment: 'T16' },  // T16 D8
      63: { score: 13, multiplier: 3, segment: 'T13' },  // T13 D12
      62: { score: 10, multiplier: 3, segment: 'T10' },  // T10 D16
      61: { score: 15, multiplier: 3, segment: 'T15' },  // T15 D8
      60: { score: 20, multiplier: 3, segment: 'T20' },  // T20
      59: { score: 19, multiplier: 3, segment: 'T19' },  // T19
      58: { score: 18, multiplier: 3, segment: 'T18' },  // T18
      57: { score: 19, multiplier: 3, segment: 'T19' },  // T19
      56: { score: 16, multiplier: 3, segment: 'T16' },  // T16
      55: { score: 15, multiplier: 3, segment: 'T15' },  // T15
      54: { score: 18, multiplier: 3, segment: 'T18' },  // T18
      53: { score: 13, multiplier: 3, segment: 'T13' },  // T13
      52: { score: 12, multiplier: 3, segment: 'T12' },  // T12
      51: { score: 17, multiplier: 3, segment: 'T17' },  // T17
      50: { score: 10, multiplier: 3, segment: 'T10' },  // T10
      49: { score: 9, multiplier: 3, segment: 'T9' },    // T9
      48: { score: 16, multiplier: 3, segment: 'T16' },  // T16
      47: { score: 7, multiplier: 3, segment: 'T7' },    // T7
      46: { score: 6, multiplier: 3, segment: 'T6' },    // T6
      45: { score: 15, multiplier: 3, segment: 'T15' },  // T15
      44: { score: 4, multiplier: 3, segment: 'T4' },    // T4
      43: { score: 13, multiplier: 3, segment: 'T13' },  // T13
      42: { score: 10, multiplier: 3, segment: 'T10' },  // T10
      41: { score: 9, multiplier: 3, segment: 'T9' },    // T9
    };

    // Direct checkout on double
    if (remaining <= 40 && remaining % 2 === 0) {
      return { score: remaining / 2, multiplier: 2, segment: `D${remaining / 2}` };
    }
    // Bull checkout
    if (remaining === 50) {
      return { score: 50, multiplier: 1, segment: 'BULL' };
    }

    return checkouts[remaining] || null;
  }

  // Throw a dart at a target with realistic accuracy
  private throwDart(target: { score: number; multiplier: 1 | 2 | 3; segment: string }): { dart: DartThrow; position: BoardPosition } {
    // Calculate accuracy based on bot level
    const accuracyRoll = Math.random();
    const hitTarget = accuracyRoll < this.baseAccuracy;

    let actualSegment = target.segment;
    let actualScore = target.score;
    let actualMultiplier = target.multiplier;

    if (!hitTarget) {
      // Miss - determine where it actually lands based on variance
      const missResult = this.calculateMiss(target);
      actualSegment = missResult.segment;
      actualScore = missResult.score;
      actualMultiplier = missResult.multiplier as 1 | 2 | 3;
    }

    // Calculate visual position on board
    const position = this.calculatePosition(actualScore, actualMultiplier, !hitTarget);

    return {
      dart: {
        score: actualScore,
        multiplier: actualMultiplier,
        segment: actualSegment,
      },
      position,
    };
  }

  // Calculate where a miss lands
  private calculateMiss(target: { score: number; multiplier: 1 | 2 | 3; segment: string }): { score: number; multiplier: 1 | 2 | 3; segment: string } {
    // Common miss patterns based on target
    const misses: Array<{ score: number; multiplier: 1 | 2 | 3; segment: string; weight: number }> = [];

    if (target.segment.startsWith('T')) {
      // Missing triple usually hits single of same number or adjacent
      misses.push(
        { score: target.score, multiplier: 1, segment: `S${target.score}`, weight: 40 }, // Single same number
        { score: this.getAdjacentNumber(target.score, -1), multiplier: 1, segment: `S${this.getAdjacentNumber(target.score, -1)}`, weight: 20 },
        { score: this.getAdjacentNumber(target.score, 1), multiplier: 1, segment: `S${this.getAdjacentNumber(target.score, 1)}`, weight: 20 },
        { score: target.score, multiplier: 2, segment: `D${target.score}`, weight: 15 }, // Double same
        { score: 0, multiplier: 1, segment: 'MISS', weight: 5 },
      );
    } else if (target.segment.startsWith('D')) {
      // Missing double usually hits single or goes outside
      misses.push(
        { score: target.score, multiplier: 1, segment: `S${target.score}`, weight: 50 },
        { score: 0, multiplier: 1, segment: 'MISS', weight: 30 }, // Outside board
        { score: target.score, multiplier: 3, segment: `T${target.score}`, weight: 15 },
        { score: this.getAdjacentNumber(target.score, -1), multiplier: 1, segment: `S${this.getAdjacentNumber(target.score, -1)}`, weight: 5 },
      );
    } else {
      // Missing single - could hit adjacent or triple
      misses.push(
        { score: this.getAdjacentNumber(target.score, -1), multiplier: 1, segment: `S${this.getAdjacentNumber(target.score, -1)}`, weight: 25 },
        { score: this.getAdjacentNumber(target.score, 1), multiplier: 1, segment: `S${this.getAdjacentNumber(target.score, 1)}`, weight: 25 },
        { score: target.score, multiplier: 3, segment: `T${target.score}`, weight: 20 },
        { score: target.score, multiplier: 2, segment: `D${target.score}`, weight: 20 },
        { score: 0, multiplier: 1, segment: 'MISS', weight: 10 },
      );
    }

    return this.weightedRandom(misses);
  }

  // Get adjacent number on dartboard
  private getAdjacentNumber(num: number, direction: -1 | 1): number {
    const order = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const idx = order.indexOf(num);
    if (idx === -1) return num;
    
    const newIdx = (idx + direction + order.length) % order.length;
    return order[newIdx];
  }

  // Calculate visual position on dartboard
  private calculatePosition(score: number, multiplier: 1 | 2 | 3, isMiss: boolean): BoardPosition {
    let radius: number;
    let angle: number;

    // Get angle for the number
    if (score === 50) {
      angle = 0;
      radius = 3;
    } else if (score === 25) {
      angle = 0;
      radius = 10;
    } else if (score === 0) {
      // Miss - outside the board or wire
      angle = Math.random() * 360;
      radius = 105 + Math.random() * 10;
    } else {
      angle = SEGMENT_ANGLES[score] || 0;
      
      // Add some variance to angle within the segment
      const segmentWidth = 18; // degrees
      angle += (Math.random() - 0.5) * segmentWidth;

      // Determine radius based on multiplier
      switch (multiplier) {
        case 3: // Triple
          radius = 56 + (Math.random() - 0.5) * 4;
          break;
        case 2: // Double
          radius = 87 + (Math.random() - 0.5) * 4;
          break;
        default: // Single
          if (angle % 360 < 10 && Math.random() > 0.5) {
            // Sometimes hit inner single, sometimes outer
            radius = 30 + Math.random() * 20;
          } else {
            radius = 60 + Math.random() * 20;
          }
      }
    }

    // Add variance for misses
    if (isMiss && score !== 0) {
      radius += (Math.random() - 0.5) * 15;
      angle += (Math.random() - 0.5) * 20;
    }

    // Convert to cartesian coordinates
    const rad = (angle * Math.PI) / 180;
    const x = 50 + (radius / 100) * 50 * Math.cos(rad);
    const y = 50 + (radius / 100) * 50 * Math.sin(rad);

    return { x, y, angle, distance: radius };
  }

  // Check if throw is a bust
  private isBust(remaining: number, dart: DartThrow): boolean {
    const newScore = remaining - (dart.score * dart.multiplier);
    return newScore < 0 || newScore === 1;
  }

  // Weighted random selection
  private weightedRandom<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item;
    }
    
    return items[items.length - 1];
  }

  // Get recent average
  getRecentAverage(): number {
    if (this.recentAverages.length === 0) return 0;
    const sum = this.recentAverages.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.recentAverages.length);
  }

  // Reset stats
  reset(): void {
    this.recentAverages = [];
  }
}

// Export singleton
export const dartBot = new DartBot(55);
