import styles from './LiveStats.module.css';

export function LiveStats({ wpm, accuracy, remaining, totalSeconds }) {
  const pct = Math.max(0, (remaining / totalSeconds) * 100);
  const isLow = remaining <= 10;

  return (
    <div className={styles.wrapper}>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.value}>{wpm > 0 ? wpm : '--'}</span>
          <span className={styles.label}>WPM</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{Math.round(accuracy * 100)}%</span>
          <span className={styles.label}>Accuracy</span>
        </div>
        <div className={styles.stat}>
          <span className={[styles.value, isLow ? styles.low : ''].filter(Boolean).join(' ')}>
            {remaining}s
          </span>
          <span className={styles.label}>Remaining</span>
        </div>
      </div>
      <div className={styles.timerBar}>
        <div
          className={[styles.timerFill, isLow ? styles.timerLow : ''].filter(Boolean).join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
