import { useState } from 'react';
import { MODES } from '../config/modes.js';
import { WpmChart } from '../components/WpmChart.jsx';
import styles from './ProgressScreen.module.css';

export function ProgressScreen({ getHistoryForMode, currentLevels, onBack, onReset }) {
  const [activeMode, setActiveMode] = useState('easy');
  const data = getHistoryForMode(activeMode);

  const totalGames = Object.keys(MODES).reduce(
    (sum, m) => sum + getHistoryForMode(m).length, 0,
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <h2 className={styles.heading}>Your Progress</h2>
        {totalGames > 0 && (
          <button className={styles.resetBtn} onClick={onReset}>Reset All</button>
        )}
        {totalGames === 0 && <span />}
      </div>

      <div className={styles.tabs}>
        {Object.entries(MODES).map(([key, mode]) => (
          <button
            key={key}
            className={[styles.tab, activeMode === key ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => setActiveMode(key)}
          >
            {mode.emoji} {mode.label}
            <span className={styles.levelBadge}>Lv {currentLevels[key] ?? 1}</span>
          </button>
        ))}
      </div>

      <div className={styles.chart}>
        <WpmChart data={data} />
      </div>

      {data.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>{data.length}</span>
            <span className={styles.summaryLabel}>Games</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {Math.max(...data.map(d => d.wpm))}
            </span>
            <span className={styles.summaryLabel}>Best WPM</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {Math.round(data.reduce((s, d) => s + d.wpm, 0) / data.length)}
            </span>
            <span className={styles.summaryLabel}>Avg WPM</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryValue}>
              {Math.round((data.filter(d => d.passed).length / data.length) * 100)}%
            </span>
            <span className={styles.summaryLabel}>Pass Rate</span>
          </div>
        </div>
      )}
    </div>
  );
}
