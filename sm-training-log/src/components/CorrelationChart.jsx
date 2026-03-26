import { useState, useMemo } from 'react';
import { FEEL_EMOJIS } from '../lib/constants';

/**
 * CorrelationChart Component
 * Visualizes the relationship between breathing score and leg freshness
 * Shows a scatterplot with points colored by overall feel
 *
 * Props:
 * - logs: array of log objects with feel_breathing, feel_legs, feel_overall
 * - days: number of days to analyze (default: 30)
 */
export default function CorrelationChart({ logs, days = 30 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter to recent logs and compute correlation
  const stats = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    // Get recent logs
    const recentLogs = logs.slice(0, days).filter(log =>
      log.feel_breathing && log.feel_legs && log.feel_overall
    );

    if (recentLogs.length < 3) return null;

    // Extract arrays
    const breathing = recentLogs.map(l => l.feel_breathing);
    const legs = recentLogs.map(l => l.feel_legs);
    const overall = recentLogs.map(l => l.feel_overall);

    // Calculate correlation coefficient (Pearson)
    const n = breathing.length;
    const meanBreath = breathing.reduce((a, b) => a + b, 0) / n;
    const meanLegs = legs.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomBreath = 0;
    let denomLegs = 0;

    for (let i = 0; i < n; i++) {
      const dx = breathing[i] - meanBreath;
      const dy = legs[i] - meanLegs;
      numerator += dx * dy;
      denomBreath += dx * dx;
      denomLegs += dy * dy;
    }

    const correlation = numerator / Math.sqrt(denomBreath * denomLegs);

    // Calculate average feel per breathing level
    const avgLegsByBreathing = {};
    for (let b = 1; b <= 5; b++) {
      const matching = recentLogs.filter(l => l.feel_breathing === b);
      if (matching.length > 0) {
        avgLegsByBreathing[b] = matching.reduce((sum, l) => sum + l.feel_legs, 0) / matching.length;
      }
    }

    return {
      logs: recentLogs,
      correlation: correlation.toFixed(2),
      meanBreath: meanBreath.toFixed(1),
      meanLegs: meanLegs.toFixed(1),
      avgLegsByBreathing,
      count: n,
    };
  }, [logs, days]);

  if (!stats) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Not enough data yet. Add more logs to see correlation analysis.</p>
      </div>
    );
  }

  // Map score to color (1=red, 5=green)
  const getColorByScore = (score) => {
    const colors = {
      1: 'rgb(239, 68, 68)',   // red
      2: 'rgb(249, 115, 22)',  // orange
      3: 'rgb(234, 179, 8)',   // yellow
      4: 'rgb(34, 197, 94)',   // green
      5: 'rgb(22, 163, 74)',   // dark green
    };
    return colors[score] || 'gray';
  };

  // Create SVG scatterplot
  const size = 300;
  const padding = 40;
  const plotSize = size - 2 * padding;
  const scale = plotSize / 4; // Scale for 1-5 range

  const points = stats.logs.map((log, idx) => ({
    x: padding + (log.feel_breathing - 1) * scale,
    y: padding + (5 - log.feel_legs) * scale, // Invert Y for SVG
    color: getColorByScore(log.feel_overall),
    date: log.log_date,
    idx,
  }));

  // Calculate trend line
  const trendPoints = [];
  for (let b = 1; b <= 5; b++) {
    if (stats.avgLegsByBreathing[b]) {
      const x = padding + (b - 1) * scale;
      const y = padding + (5 - stats.avgLegsByBreathing[b]) * scale;
      trendPoints.push({ x, y });
    }
  }

  const trendLine = trendPoints.length > 1
    ? `M ${trendPoints.map(p => `${p.x},${p.y}`).join(' L ')}`
    : null;

  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600">Correlation</p>
          <p className="text-2xl font-bold text-blue-600">{stats.correlation}</p>
          <p className="text-xs text-gray-500 mt-1">
            {Math.abs(stats.correlation) > 0.7 ? 'Strong' : Math.abs(stats.correlation) > 0.4 ? 'Moderate' : 'Weak'}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600">Avg Breathing</p>
          <p className="text-2xl font-bold text-purple-600">{stats.meanBreath}</p>
          <p className="text-xs text-gray-500 mt-1">/5</p>
        </div>
        <div className="bg-pink-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600">Avg Legs</p>
          <p className="text-2xl font-bold text-pink-600">{stats.meanLegs}</p>
          <p className="text-xs text-gray-500 mt-1">/5</p>
        </div>
      </div>

      {/* Scatterplot */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
        <svg width={size} height={size} className="mx-auto">
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map(i => (
            <line
              key={`v${i}`}
              x1={padding + (i - 1) * scale}
              y1={padding}
              x2={padding + (i - 1) * scale}
              y2={size - padding}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
          ))}
          {[1, 2, 3, 4, 5].map(i => (
            <line
              key={`h${i}`}
              x1={padding}
              y1={padding + (i - 1) * scale}
              x2={size - padding}
              y2={padding + (i - 1) * scale}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
          ))}

          {/* Axes */}
          <line x1={padding} y1={size - padding} x2={size - padding} y2={size - padding} stroke="#000" strokeWidth="2" />
          <line x1={padding} y1={padding} x2={padding} y2={size - padding} stroke="#000" strokeWidth="2" />

          {/* Trend line */}
          {trendLine && (
            <path
              d={trendLine}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          )}

          {/* Data points */}
          {points.map((point, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === idx ? 6 : 4}
                fill={point.color}
                opacity={hoveredPoint === idx ? 1 : 0.7}
                className="cursor-pointer transition"
                strokeWidth="1"
                stroke="white"
              />
            </g>
          ))}

          {/* Axis labels */}
          {[1, 2, 3, 4, 5].map(i => (
            <g key={`xlabel${i}`}>
              <text
                x={padding + (i - 1) * scale}
                y={size - padding + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {i}
              </text>
            </g>
          ))}
          {[1, 2, 3, 4, 5].map(i => (
            <g key={`ylabel${i}`}>
              <text
                x={padding - 15}
                y={padding + (i - 1) * scale + 4}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
              >
                {6 - i}
              </text>
            </g>
          ))}

          {/* Axis titles */}
          <text
            x={size / 2}
            y={size - 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#000"
          >
            Breathing Score →
          </text>
          <text
            x={15}
            y={size / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#000"
            transform={`rotate(-90 15 ${size / 2})`}
          >
            Leg Freshness →
          </text>
        </svg>
      </div>

      {/* Interpretation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">What this shows:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            <strong>Correlation {Math.abs(stats.correlation) > 0.5 ? '✓' : '✗'}:</strong> {
              Math.abs(stats.correlation) > 0.7
                ? 'Breathing is a strong predictor of leg freshness. Poor breathing often means poor leg performance.'
                : Math.abs(stats.correlation) > 0.4
                ? 'Breathing and legs are moderately linked. Other factors also affect leg performance.'
                : 'Breathing and legs vary independently. Your legs don\'t depend heavily on breathing quality.'
            }
          </li>
          <li>
            <strong>Data points:</strong> Each dot represents a day. Blue trend line shows the average pattern.
          </li>
          <li>
            <strong>Color:</strong> Red (poor overall) → Green (excellent overall feel)
          </li>
        </ul>
      </div>
    </div>
  );
}
