import styles from './ResultScreen.module.css';

export function ResultScreen({ mode, level, wpm, accuracy, requiredWPM, passed, onNext, onRetry, onHome }) {
  return (
    <div className={styles.wrapper}>
      <div className={[styles.banner, passed ? styles.pass : styles.fail].join(' ')}>
        {passed ? '🎉 Level Passed!' : '❌ Not Quite'}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.value}>{wpm}</span>
          <span className={styles.label}>WPM</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{Math.round(accuracy * 100)}%</span>
          <span className={styles.label}>Accuracy</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{requiredWPM}</span>
          <span className={styles.label}>Required WPM</span>
        </div>
      </div>

      {!passed && (
        <p className={styles.message}>
          You needed <strong>{requiredWPM} WPM</strong> but hit <strong>{wpm} WPM</strong>.{' '}
          {requiredWPM - wpm <= 5
            ? 'So close! One more try.'
            : 'Keep practicing — you\'ll get there!'}
        </p>
      )}

      {passed && (
        <p className={styles.message}>
          You unlocked <strong>Level {level + 1}</strong> in {mode} mode.
        </p>
      )}

      <div className={styles.actions}>
        {passed && (
          <button className={`${styles.btn} ${styles.primary}`} onClick={onNext}>
            Next Level →
          </button>
        )}
        <button className={`${styles.btn} ${styles.secondary}`} onClick={onRetry}>
          Retry Level
        </button>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
}
