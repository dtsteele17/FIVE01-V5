import React, { useRef, useEffect, useState } from 'react';

interface Dart {
  id: string;
  x: number;
  y: number;
  score: number;
  multiplier: number;
  segment: string;
}

interface PNGDartboardProps {
  darts: Dart[];
  size?: number;
  className?: string;
}

const WEDGE_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export const PNGDartboard: React.FC<PNGDartboardProps> = ({
  darts,
  size = 420,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayDarts, setDisplayDarts] = useState<Dart[]>([]);

  useEffect(() => {
    setDisplayDarts([]);
    darts.forEach((dart, index) => {
      setTimeout(() => {
        setDisplayDarts(prev => [...prev, dart]);
      }, index * 200);
    });
  }, [darts]);

  const dartboardImageUrl = 'https://0ec90b57d6e95fcbda19832f.supabase.co/storage/v1/object/public/photo/PNG%20DARTBOARD.png';

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={dartboardImageUrl}
        alt="Dartboard"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      />

      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <filter id="dartGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="1.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {displayDarts.map((dart, index) => {
          const x = (dart.x / 100) * size;
          const y = (dart.y / 100) * size;

          return (
            <g key={dart.id} style={{ animation: 'dartPop 0.3s ease-out' }}>
              <circle
                cx={x}
                cy={y}
                r={18}
                fill="rgba(251, 191, 36, 0.5)"
                filter="url(#dartGlow)"
              />

              <circle
                cx={x + 2}
                cy={y + 3}
                r={8}
                fill="rgba(0, 0, 0, 0.6)"
              />

              <circle
                cx={x}
                cy={y}
                r={10}
                fill="#fbbf24"
                stroke="#fff"
                strokeWidth={3}
              />

              <circle
                cx={x}
                cy={y}
                r={7}
                fill="#f59e0b"
                stroke="#000"
                strokeWidth={1.5}
              />

              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={12}
                fontWeight="bold"
                stroke="#000"
                strokeWidth={0.5}
              >
                {index + 1}
              </text>
            </g>
          );
        })}
      </svg>

      <style>{`
        @keyframes dartPop {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export function calculateDartScore(
  x: number,
  y: number,
  boardSize: number = 100
): { score: number; multiplier: number; segment: string } {
  const cx = boardSize / 2;
  const cy = boardSize / 2;

  const dx = x - cx;
  const dy = y - cy;

  const r = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);

  const R = boardSize / 2;
  const R_DOUBLE_OUTER = 1.00 * R;
  const R_DOUBLE_INNER = 0.95 * R;
  const R_TREBLE_OUTER = 0.60 * R;
  const R_TREBLE_INNER = 0.55 * R;
  const R_BULL_OUTER = 0.10 * R;
  const R_BULL_INNER = 0.04 * R;

  if (r > R_DOUBLE_OUTER) {
    return { score: 0, multiplier: 1, segment: 'MISS' };
  }

  if (r <= R_BULL_INNER) {
    return { score: 50, multiplier: 1, segment: 'BULL' };
  }

  if (r <= R_BULL_OUTER) {
    return { score: 25, multiplier: 1, segment: 'OUTER' };
  }

  const thetaTop = -Math.PI / 2;
  let a = theta - thetaTop;

  while (a < 0) a += 2 * Math.PI;
  while (a >= 2 * Math.PI) a -= 2 * Math.PI;

  const wedgeIndex = Math.floor(a / (2 * Math.PI / 20));
  const number = WEDGE_ORDER[wedgeIndex % 20];

  let multiplier = 1;
  let segment = `S${number}`;

  if (r >= R_DOUBLE_INNER && r <= R_DOUBLE_OUTER) {
    multiplier = 2;
    segment = `D${number}`;
  } else if (r >= R_TREBLE_INNER && r <= R_TREBLE_OUTER) {
    multiplier = 3;
    segment = `T${number}`;
  }

  return { score: number, multiplier, segment };
}

export default PNGDartboard;
