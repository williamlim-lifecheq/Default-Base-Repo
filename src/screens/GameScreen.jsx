import { useState, useEffect, useMemo } from 'react';
import { getLevelConfig } from '../config/levels.js';
import { getPassage } from '../data/passages.js';
import { useTypingGame } from '../hooks/useTypingGame.js';
import { TextDisplay } from '../components/TextDisplay.jsx';
import { LiveStats } from '../components/LiveStats.jsx';
import { Countdown } from '../components/Countdown.jsx';
import { RaceTrack } from '../components/RaceTrack.jsx';
import styles from './GameScreen.module.css';

const AI_RACERS = [
  { name: 'Rival',  emoji: '🚗', speedFactor: 1.1,  color: '#f87171' },
  { name: 'Rookie', emoji: '🛺', speedFactor: 0.75, color: '#facc15' },
];

export function GameScreen({ mode, level, attempt, onGameEnd }) {
  const levelConfig = getLevelConfig(mode, level);

  const passages = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) =>
        getPassage(levelConfig.tier, level, attempt * 15 + i),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const {
    phase, elapsed, remaining, wpm, accuracy, charStatuses,
    cursorPosition, inputRef, startCountdown, startActive, onInput,
    typed, passageIndex, totalCorrectChars, currentPassageCorrectChars,
  } = useTypingGame({ passages, timerSeconds: levelConfig.timerSeconds });

  const [countdownDone, setCountdownDone] = useState(false);

  useEffect(() => {
    startCountdown();
  }, [startCountdown]);

  useEffect(() => {
    if (countdownDone) startActive();
  }, [countdownDone, startActive]);

  useEffect(() => {
    if (phase === 'finished') {
      onGameEnd({ wpm, accuracy, elapsed, mode, level, requiredWPM: levelConfig.requiredWPM });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Race track positions
  const trackLength = (levelConfig.requiredWPM * 5 / 60) * levelConfig.timerSeconds;
  const totalCorrect = totalCorrectChars + currentPassageCorrectChars;
  const playerPct = trackLength > 0 ? Math.min(100, (totalCorrect / trackLength) * 100) : 0;

  const aiRacers = AI_RACERS.map((r) => ({
    ...r,
    pct: elapsed > 0
      ? Math.min(100, (elapsed / levelConfig.timerSeconds) * r.speedFactor * 100)
      : 0,
  }));

  const currentPassage = passages[passageIndex];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.badge}>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</span>
        <span className={styles.badge}>Level {level}</span>
        <span className={styles.badge}>Target: {levelConfig.requiredWPM} WPM</span>
      </div>

      <RaceTrack playerPct={playerPct} racers={aiRacers} />

      <LiveStats
        wpm={wpm}
        accuracy={accuracy}
        remaining={remaining}
        totalSeconds={levelConfig.timerSeconds}
      />

      <div
        className={styles.textArea}
        onClick={() => inputRef.current?.focus()}
      >
        {phase === 'countdown' && (
          <Countdown onComplete={() => setCountdownDone(true)} />
        )}
        <TextDisplay
          passage={currentPassage}
          charStatuses={charStatuses}
          cursorPosition={cursorPosition}
        />
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
