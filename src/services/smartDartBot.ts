import { calculateDartScore } from '../components/dartboard/PNGDartboard';

export type DartBotLevel = 20 | 25 | 35 | 45 | 55 | 65 | 75 | 85 | 95;

interface DartThrow {
  score: number;
  multiplier: number;
  segment: string;
  position: { x: number; y: number };
}

const CHECKOUT_ROUTES: Record<number, string[]> = {
  170: ['T20', 'T20', 'BULL'], 167: ['T20', 'T19', 'BULL'], 164: ['T20', 'T18', 'BULL'],
  161: ['T20', 'T17', 'BULL'], 160: ['T20', 'T20', 'D20'], 158: ['T20', 'T20', 'D19'],
  157: ['T20', 'T19', 'D20'], 156: ['T20', 'T20', 'D18'], 155: ['T20', 'T19', 'D19'],
  154: ['T20', 'T18', 'D20'], 153: ['T20', 'T19', 'D18'], 152: ['T20', 'T20', 'D16'],
  151: ['T20', 'T17', 'D20'], 150: ['T20', 'T18', 'D18'], 149: ['T20', 'T19', 'D16'],
  148: ['T20', 'T20', 'D14'], 147: ['T20', 'T17', 'D18'], 146: ['T20', 'T18', 'D16'],
  145: ['T20', 'T19', 'D14'], 144: ['T20', 'T20', 'D12'], 143: ['T20', 'T17', 'D16'],
  142: ['T20', 'T14', 'D20'], 141: ['T20', 'T19', 'D12'], 140: ['T20', 'T20', 'D10'],
  139: ['T20', 'T13', 'D20'], 138: ['T20', 'T18', 'D12'], 137: ['T20', 'T19', 'D10'],
  136: ['T20', 'T20', 'D8'], 135: ['T20', 'T17', 'D12'], 134: ['T20', 'T14', 'D16'],
  133: ['T20', 'T19', 'D8'], 132: ['T20', 'T16', 'D12'], 131: ['T20', 'T13', 'D16'],
  130: ['T20', 'T20', 'D5'], 129: ['T19', 'T16', 'D12'], 128: ['T18', 'T14', 'D16'],
  127: ['T20', 'T17', 'D8'], 126: ['T19', 'T19', 'D6'], 125: ['T20', 'T19', 'D4'],
  124: ['T20', 'T14', 'D11'], 123: ['T19', 'T16', 'D9'], 122: ['T18', 'T18', 'D7'],
  121: ['T20', 'T11', 'D14'], 120: ['T20', 'S20', 'D20'], 119: ['T19', 'T12', 'D13'],
  118: ['T20', 'S18', 'D20'], 117: ['T20', 'S17', 'D20'], 116: ['T20', 'S16', 'D20'],
  115: ['T20', 'S15', 'D20'], 114: ['T20', 'S14', 'D20'], 113: ['T20', 'S13', 'D20'],
  112: ['T20', 'S12', 'D20'], 111: ['T20', 'S11', 'D20'], 110: ['T20', 'BULL'],
  107: ['T19', 'BULL'], 104: ['T18', 'BULL'], 101: ['T17', 'D25'], 100: ['T20', 'D20'],
  98: ['T20', 'D19'], 96: ['T20', 'D18'], 94: ['T18', 'D20'], 92: ['T20', 'D16'],
  90: ['T20', 'D15'], 88: ['T20', 'D14'], 86: ['T18', 'D16'], 84: ['T20', 'D12'],
  82: ['T14', 'D20'], 80: ['T20', 'D10'], 78: ['T18', 'D12'], 76: ['T20', 'D8'],
  74: ['T14', 'D16'], 72: ['T16', 'D12'], 70: ['T10', 'D20'], 68: ['T20', 'D4'],
  66: ['T10', 'D18'], 64: ['T16', 'D8'], 62: ['T10', 'D16'], 60: ['S20', 'D20'],
  58: ['S18', 'D20'], 56: ['T16', 'D4'], 54: ['S14', 'D20'], 52: ['T12', 'D8'],
  50: ['BULL'], 48: ['S8', 'D20'], 46: ['S6', 'D20'], 44: ['S4', 'D20'], 42: ['S10', 'D16'],
  40: ['D20'], 38: ['D19'], 36: ['D18'], 34: ['D17'], 32: ['D16'], 30: ['D15'],
  28: ['D14'], 26: ['D13'], 24: ['D12'], 22: ['D11'], 20: ['D10'], 18: ['D9'],
  16: ['D8'], 14: ['D7'], 12: ['D6'], 10: ['D5'], 8: ['D4'], 6: ['D3'], 4: ['D2'], 2: ['D1'],
};

export class SmartDartBot {
  private sigma: number;

  constructor(level: DartBotLevel) {
    const sigmaMap: Record<DartBotLevel, number> = {
      20: 8.5, 25: 7.0, 35: 6.5, 45: 5.0, 55: 3.5,
      65: 2.5, 75: 1.8, 85: 1.2, 95: 0.7
    };
    this.sigma = sigmaMap[level];
  }

  generateVisit(remaining: number): {
    darts: DartThrow[];
    total: number;
    positions: { x: number; y: number }[];
  } {
    const darts: DartThrow[] = [];
    const positions: { x: number; y: number }[] = [];
    let currentRemaining = remaining;
    let dartsThrown = 0;

    while (dartsThrown < 3 && currentRemaining > 0) {
      const dart = this.throwDart(currentRemaining, dartsThrown);
      darts.push(dart);
      positions.push(dart.position);

      const dartValue = dart.score * dart.multiplier;

      if (currentRemaining - dartValue < 0 || currentRemaining - dartValue === 1) {
        break;
      }

      currentRemaining -= dartValue;

      if (currentRemaining === 0 && (dart.multiplier === 2 || dart.score === 50)) {
        break;
      }

      if (currentRemaining === 0) {
        break;
      }

      dartsThrown++;
    }

    const total = darts.reduce((sum, d) => sum + (d.score * d.multiplier), 0);

    return { darts, total, positions };
  }

  private throwDart(remaining: number, dartNumber: number): DartThrow {
    const target = this.selectTarget(remaining, dartNumber);
    const position = this.aimAtTarget(target);
    const result = calculateDartScore(position.x, position.y, 100);

    return {
      score: result.score,
      multiplier: result.multiplier,
      segment: result.segment,
      position,
    };
  }

  private selectTarget(remaining: number, dartNumber: number): string {
    if (remaining <= 170 && remaining >= 2) {
      const route = CHECKOUT_ROUTES[remaining];
      if (route && dartNumber < route.length) {
        return route[dartNumber];
      }

      if (remaining <= 40 && remaining % 2 === 0) {
        return `D${remaining / 2}`;
      }

      if (dartNumber === 0) {
        if (remaining > 60) {
          return 'T20';
        } else if (remaining === 50) {
          return 'BULL';
        } else if (remaining > 40) {
          const needToScore = remaining - 40;
          if (needToScore === 20) return 'S20';
          if (needToScore === 19) return 'S19';
          if (needToScore === 18) return 'S18';
          if (needToScore <= 20) return `S${needToScore}`;
          return 'T20';
        } else if (remaining > 20 && remaining % 2 === 1) {
          return 'S1';
        } else {
          return `D${Math.floor(remaining / 2)}`;
        }
      }

      if (remaining > 50) {
        return 'T20';
      } else if (remaining === 50) {
        return 'BULL';
      } else if (remaining <= 40 && remaining % 2 === 0) {
        return `D${remaining / 2}`;
      } else if (remaining % 2 === 1 && remaining > 1) {
        return 'S1';
      }
    }

    return 'T20';
  }

  private aimAtTarget(target: string): { x: number; y: number } {
    const boardCenter = 50;
    let targetX = boardCenter;
    let targetY = boardCenter;

    if (target === 'BULL') {
      targetX = boardCenter;
      targetY = boardCenter;
    } else if (target === 'OUTER') {
      targetX = boardCenter;
      targetY = boardCenter + 5;
    } else if (target.startsWith('T')) {
      const num = parseInt(target.substring(1));
      const pos = this.getSegmentPosition(num, 0.575);
      targetX = pos.x;
      targetY = pos.y;
    } else if (target.startsWith('D')) {
      const num = parseInt(target.substring(1));
      const pos = this.getSegmentPosition(num, 0.975);
      targetX = pos.x;
      targetY = pos.y;
    } else if (target.startsWith('S')) {
      const num = parseInt(target.substring(1));
      const pos = this.getSegmentPosition(num, 0.75);
      targetX = pos.x;
      targetY = pos.y;
    }

    const scatterX = this.gaussian(0, this.sigma);
    const scatterY = this.gaussian(0, this.sigma);

    let finalX = targetX + scatterX;
    let finalY = targetY + scatterY;

    finalX = Math.max(2, Math.min(98, finalX));
    finalY = Math.max(2, Math.min(98, finalY));

    return { x: finalX, y: finalY };
  }

  private getSegmentPosition(number: number, radiusRatio: number): { x: number; y: number } {
    const wedgeOrder = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const wedgeIndex = wedgeOrder.indexOf(number);

    if (wedgeIndex === -1) {
      return { x: 50, y: 50 };
    }

    const anglePerWedge = (2 * Math.PI) / 20;
    const thetaTop = -Math.PI / 2;
    const angle = thetaTop + (wedgeIndex * anglePerWedge) + (anglePerWedge / 2);

    const boardRadius = 50;
    const r = radiusRatio * boardRadius;

    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);

    return { x, y };
  }

  private gaussian(mean: number, sigma: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + sigma * z0;
  }
}

export default SmartDartBot;
