import { useState, useEffect } from 'react';
import { getLevelConfig } from '../config/levels.js';
import { getPassage } from '../data/passages.js';
import { useTypingGame } from '../hooks/useTypingGame.js';
import { TextDisplay } from '../components/TextDisplay.jsx';
import { LiveStats } from '../components/LiveStats.jsx';
import { Countdown } from '../components/Countdown.jsx';
import styles from './GameScreen.module.css';

export function GameScreen({ mode, level, attempt, onGameEnd }) {
  const levelConfig = getLevelConfig(mode, level);
  const passage = getPassage(levelConfig.tier, level, attempt);

  const {
    phase, elapsed, remaining, wpm, accuracy, charStatuses,
    cursorPosition, inputRef, startCountdown, startActive, onInput, typed,
  } = useTypingGame({ passage, timerSeconds: levelConfig.timerSeconds });

  const [countdownDone, setCountdownDone] = useState(false);

  useEffect(() => {
    startCountdown();
  }, [startCountdown]);

  useEffect(() => {
    if (countdownDone) {
      startActive();
    }
  }, [countdownDone, startActive]);

  useEffect(() => {
    if (phase === 'finished') {
      onGameEnd({ wpm, accuracy, elapsed, mode, level, requiredWPM: levelConfig.requiredWPM });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCountdownComplete = () => setCountdownDone(true);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.badge}>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</span>
        <span className={styles.badge}>Level {level}</span>
        <span className={styles.badge}>Target: {levelConfig.requiredWPM} WPM</span>
      </div>

      <LiveStats
        wpm={wpm}
        accuracy={accuracy}
        remaining={remaining}
        totalSeconds={levelConfig.timerSeconds}
      />

      <div className={styles.textArea}
        onClick={() => inputRef.current?.focus()}
      >
        {phase === 'countdown' && (
          <Countdown onComplete={handleCountdownComplete} />
        )}
        <TextDisplay
          passage={passage}
          charStatuses={charStatuses}
          cursorPosition={cursorPosition}
        />
        {/* Hidden input captures keystrokes */}
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          type="text"
          value={typed}
          onChange={onInput}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          tabIndex={0}
          aria-label="Type here"
        />
      </div>

      <p className={styles.hint}>
        {phase === 'countdown' ? 'Get ready…' :
         phase === 'active' ? 'Click the text area if focus is lost' :
         'Finished!'}
      </p>
    </div>
  );
}
