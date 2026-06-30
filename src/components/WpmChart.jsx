import styles from './WpmChart.module.css';

const W = 600;
const H = 200;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function xScale(i, n) {
  if (n <= 1) return PAD.left + INNER_W / 2;
  return PAD.left + (i / (n - 1)) * INNER_W;
}

function yScale(wpm, maxWpm) {
  const top = maxWpm * 1.2 || 100;
  return PAD.top + INNER_H - (wpm / top) * INNER_H;
}

const Y_TICKS = 5;

export function WpmChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty}>
        No games played yet in this mode. Start playing to see your progress!
      </div>
    );
  }

  const maxWpm = Math.max(...data.map(d => d.wpm), 10);
  const topY = maxWpm * 1.2;

  const points = data.map((d, i) => `${xScale(i, data.length)},${yScale(d.wpm, maxWpm)}`).join(' ');

  const yTickValues = Array.from({ length: Y_TICKS }, (_, i) =>
    Math.round((topY / (Y_TICKS - 1)) * i),
  );

  return (
    <div className={styles.wrapper}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="WPM chart">
        {/* Y-axis grid + labels */}
        {yTickValues.map(val => {
          const y = yScale(val, maxWpm);
          return (
            <g key={val}>
              <line
                x1={PAD.left} y1={y}
                x2={W - PAD.right} y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1"
              />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" className={styles.tick}>
                {val}
              </text>
            </g>
          );
        })}

        {/* X-axis game labels */}
        {data.map((_, i) => {
          if (data.length > 12 && i % Math.ceil(data.length / 10) !== 0) return null;
          return (
            <text
              key={i}
              x={xScale(i, data.length)}
              y={H - PAD.bottom + 18}
              textAnchor="middle"
              className={styles.tick}
            >
              {i + 1}
            </text>
          );
        })}

        {/* Axis labels */}
        <text x={PAD.left - 36} y={PAD.top + INNER_H / 2} textAnchor="middle"
          transform={`rotate(-90, ${PAD.left - 36}, ${PAD.top + INNER_H / 2})`}
          className={styles.axisLabel}
        >
          WPM
        </text>
        <text x={PAD.left + INNER_W / 2} y={H - 4} textAnchor="middle" className={styles.axisLabel}>
          Game #
        </text>

        {/* Line */}
        {data.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i, data.length)}
            cy={yScale(d.wpm, maxWpm)}
            r="5"
            fill={d.passed ? '#4ade80' : '#f87171'}
            stroke="var(--bg)"
            strokeWidth="2"
          >
            <title>Game {i + 1}: {d.wpm} WPM — {d.passed ? 'Passed' : 'Failed'}</title>
          </circle>
        ))}
      </svg>
      <div className={styles.legend}>
        <span className={styles.legendPass}>● Passed</span>
        <span className={styles.legendFail}>● Failed</span>
      </div>
    </div>
  );
}
