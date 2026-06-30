import { ModeSelector } from '../components/ModeSelector.jsx';
import styles from './HomeScreen.module.css';

export function HomeScreen({ currentLevels, onStartGame, onViewProgress }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <h1 className={styles.title}>TypeRacer</h1>
        <p className={styles.subtitle}>
          Pick a difficulty mode and race against the clock to level up your typing speed.
        </p>
      </div>

      <ModeSelector currentLevels={currentLevels} onSelect={onStartGame} />

      <button className={styles.progressBtn} onClick={onViewProgress}>
        📈 View Progress
      </button>
    </div>
  );
}
