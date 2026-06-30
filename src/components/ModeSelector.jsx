import { MODES } from '../config/modes.js';
import { getLevelConfig } from '../config/levels.js';
import styles from './ModeSelector.module.css';

export function ModeSelector({ currentLevels, onSelect }) {
  return (
    <div className={styles.grid}>
      {Object.entries(MODES).map(([key, mode]) => {
        const level = currentLevels[key] ?? 1;
        const config = getLevelConfig(key, level);
        return (
          <button key={key} className={`${styles.card} ${styles[key]}`} onClick={() => onSelect(key)}>
            <span className={styles.emoji}>{mode.emoji}</span>
            <span className={styles.label}>{mode.label}</span>
            <span className={styles.desc}>{mode.description}</span>
            <div className={styles.meta}>
              <span>Level {level}</span>
              <span>Target: {config.requiredWPM} WPM</span>
              <span>{mode.timerSeconds}s timer</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
