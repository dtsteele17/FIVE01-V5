// ============================================
// FIVE01 Darts - Visual Dartboard Component
// ============================================

import React, { useEffect, useState, useRef } from 'react';
import { Target } from 'lucide-react';

interface Dart {
  id: string;
  x: number;
  y: number;
  score: number;
  multiplier: number;
  segment: string;
  delay?: number;
}

interface VisualDartboardProps {
  darts: Dart[];
  onSegmentClick?: (score: number, multiplier: number) => void;
  size?: number;
  showLabels?: boolean;
  isInteractive?: boolean;
  highlightSegment?: string;
  className?: string;
}

const SEGMENT_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export const VisualDartboard: React.FC<VisualDartboardProps> = ({
  darts,
  onSegmentClick,
  size = 320,
  showLabels = true,
  isInteractive = false,
  highlightSegment,
  className = '',
}) => {
  const [scale, setScale] = useState(1);
  const [displayDarts, setDisplayDarts] = useState<Dart[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min(1, containerWidth / size);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [size]);

  useEffect(() => {
    // Animate darts appearing one by one
    setDisplayDarts([]);
    darts.forEach((dart, index) => {
      setTimeout(() => {
        setDisplayDarts(prev => [...prev, dart]);
      }, dart.delay || index * 800);
    });
  }, [darts]);

  const center = size / 2;
  const scale2 = size / 400; // Base scale

  // Create wedge path
  const createWedgePath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + innerR * Math.cos(startRad);
    const y1 = center + innerR * Math.sin(startRad);
    const x2 = center + outerR * Math.cos(startRad);
    const y2 = center + outerR * Math.sin(startRad);
    const x3 = center + outerR * Math.cos(endRad);
    const y3 = center + outerR * Math.sin(endRad);
    const x4 = center + innerR * Math.cos(endRad);
    const y4 = center + innerR * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1}`;
  };

  // Handle segment click
  const handleSegmentClick = (score: number, multiplier: number) => {
    if (isInteractive && onSegmentClick) {
      onSegmentClick(score, multiplier);
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col items-center ${className}`}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`${isInteractive ? 'cursor-pointer' : ''}`}
        >
          <defs>
            {/* Drop shadow for darts */}
            <filter id="dartShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
            {/* Wire shadow */}
            <filter id="wireShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Outer board (number ring background) */}
          <circle cx={center} cy={center} r={center - 2} fill="#1a1a1a" stroke="#333" strokeWidth={2} />

          {/* Main board background */}
          <circle cx={center} cy={center} r={190 * scale2} fill="#1a472a" />

          {/* Segment wedges - Singles */}
          {SEGMENT_NUMBERS.map((num, i) => {
            const startAngle = i * 18 - 99; // -99 to rotate 20 to top
            const endAngle = startAngle + 18;
            const isDark = num % 2 === 0;
            const isHighlighted = highlightSegment === `S${num}`;

            return (
              <path
                key={`single-${num}`}
                d={createWedgePath(startAngle, endAngle, 15 * scale2, 185 * scale2)}
                fill={isHighlighted ? '#fbbf24' : isDark ? '#8B0000' : '#1a472a'}
                stroke="#4a5568"
                strokeWidth={1}
                className="transition-colors duration-200 hover:opacity-80"
                onClick={() => handleSegmentClick(num, 1)}
              />
            );
          })}

          {/* Segment wedges - Triples */}
          {SEGMENT_NUMBERS.map((num, i) => {
            const startAngle = i * 18 - 99;
            const endAngle = startAngle + 18;
            const isDark = num % 2 === 0;
            const isHighlighted = highlightSegment === `T${num}`;

            return (
              <path
                key={`triple-${num}`}
                d={createWedgePath(startAngle, endAngle, 100 * scale2, 120 * scale2)}
                fill={isHighlighted ? '#fbbf24' : isDark ? '#8B0000' : '#1a472a'}
                stroke="#c0392b"
                strokeWidth={2}
                filter="url(#wireShadow)"
                className="transition-colors duration-200 hover:opacity-80"
                onClick={() => handleSegmentClick(num, 3)}
              />
            );
          })}

          {/* Segment wedges - Doubles */}
          {SEGMENT_NUMBERS.map((num, i) => {
            const startAngle = i * 18 - 99;
            const endAngle = startAngle + 18;
            const isDark = num % 2 === 0;
            const isHighlighted = highlightSegment === `D${num}`;

            return (
              <path
                key={`double-${num}`}
                d={createWedgePath(startAngle, endAngle, 170 * scale2, 190 * scale2)}
                fill={isHighlighted ? '#fbbf24' : isDark ? '#8B0000' : '#1a472a'}
                stroke="#c0392b"
                strokeWidth={2}
                filter="url(#wireShadow)"
                className="transition-colors duration-200 hover:opacity-80"
                onClick={() => handleSegmentClick(num, 2)}
              />
            );
          })}

          {/* Outer Bull (25) */}
          <circle
            cx={center}
            cy={center}
            r={25 * scale2}
            fill={highlightSegment === 'OUTER' ? '#fbbf24' : '#1a472a'}
            stroke="#c0392b"
            strokeWidth={2}
            filter="url(#wireShadow)"
            className="transition-colors duration-200 hover:opacity-80"
            onClick={() => handleSegmentClick(25, 1)}
          />

          {/* Inner Bull (50) */}
          <circle
            cx={center}
            cy={center}
            r={12.5 * scale2}
            fill={highlightSegment === 'BULL' ? '#fbbf24' : '#8B0000'}
            stroke="#c0392b"
            strokeWidth={2}
            filter="url(#wireShadow)"
            className="transition-colors duration-200 hover:opacity-80"
            onClick={() => handleSegmentClick(50, 1)}
          />

          {/* Wire rings */}
          <circle cx={center} cy={center} r={100 * scale2} fill="none" stroke="#718096" strokeWidth={2} filter="url(#wireShadow)" />
          <circle cx={center} cy={center} r={120 * scale2} fill="none" stroke="#718096" strokeWidth={2} filter="url(#wireShadow)" />
          <circle cx={center} cy={center} r={170 * scale2} fill="none" stroke="#718096" strokeWidth={2} filter="url(#wireShadow)" />
          <circle cx={center} cy={center} r={190 * scale2} fill="none" stroke="#718096" strokeWidth={2} filter="url(#wireShadow)" />
          <circle cx={center} cy={center} r={25 * scale2} fill="none" stroke="#718096" strokeWidth={2} filter="url(#wireShadow)" />

          {/* Numbers */}
          {showLabels && SEGMENT_NUMBERS.map((num, i) => {
            const angle = (i * 18 - 90) * (Math.PI / 180);
            const radius = 210 * scale2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            return (
              <text
                key={`num-${num}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#e2e8f0"
                fontSize={18 * scale2}
                fontWeight="bold"
                fontFamily="Arial, sans-serif"
                className="select-none"
              >
                {num}
              </text>
            );
          })}

          {/* Darts */}
          {displayDarts.map((dart, index) => (
            <g key={dart.id}>
              {/* Dart glow/outline for visibility */}
              <circle
                cx={(dart.x / 100) * size}
                cy={(dart.y / 100) * size}
                r={12}
                fill="rgba(251, 191, 36, 0.3)"
                filter="url(#dartShadow)"
              />
              {/* Dart shadow */}
              <circle
                cx={(dart.x / 100) * size + 2}
                cy={(dart.y / 100) * size + 3}
                r={6}
                fill="rgba(0,0,0,0.4)"
              />
              {/* Dart body - larger and more visible */}
              <circle
                cx={(dart.x / 100) * size}
                cy={(dart.y / 100) * size}
                r={8}
                fill="#fbbf24"
                stroke="#fff"
                strokeWidth={2}
                filter="url(#dartShadow)"
              />
              {/* Inner dart circle for contrast */}
              <circle
                cx={(dart.x / 100) * size}
                cy={(dart.y / 100) * size}
                r={5}
                fill="#f59e0b"
                stroke="#000"
                strokeWidth={1}
              />
              {/* Dart order indicator */}
              <text
                x={(dart.x / 100) * size}
                y={(dart.y / 100) * size}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={10}
                fontWeight="bold"
                stroke="#000"
                strokeWidth={0.5}
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Dart Info */}
      {darts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {displayDarts.map((dart, i) => (
            <div
              key={dart.id}
              className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-2 animate-fadeIn"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-200">
                {dart.segment} = {dart.score * dart.multiplier}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisualDartboard;
