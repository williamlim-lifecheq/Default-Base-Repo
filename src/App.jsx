import { useState, useCallback } from 'react';
import { useProgress } from './hooks/useProgress.js';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { GameScreen } from './screens/GameScreen.jsx';
import { ResultScreen } from './screens/ResultScreen.jsx';
import { ProgressScreen } from './screens/ProgressScreen.jsx';
import styles from './App.module.css';

export default function App() {
  const { currentLevels, recordResult, getHistoryForMode, resetProgress } = useProgress();

  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null);
  const [level, setLevel] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const handleStartGame = useCallback((selectedMode) => {
    setMode(selectedMode);
    setLevel(currentLevels[selectedMode] ?? 1);
    setAttempt(0);
    setScreen('game');
  }, [currentLevels]);

  const handleGameEnd = useCallback((result) => {
    const passed = result.wpm >= result.requiredWPM;
    recordResult(result.mode, result.level, result.wpm, result.accuracy, passed);
    setLastResult({ ...result, passed });
    setScreen('result');
  }, [recordResult]);

  const handleNext = useCallback(() => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setAttempt(0);
    setScreen('game');
  }, [level]);

  const handleRetry = useCallback(() => {
    setAttempt(a => a + 1);
    setScreen('game');
  }, []);

  const handleHome = useCallback(() => {
    setScreen('home');
    setLastResult(null);
  }, []);

  const handleViewProgress = useCallback(() => {
    setScreen('progress');
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  }, [resetProgress]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        {screen === 'home' && (
          <HomeScreen
            currentLevels={currentLevels}
            onStartGame={handleStartGame}
            onViewProgress={handleViewProgress}
          />
        )}
        {screen === 'game' && mode && (
          <GameScreen
            key={`${mode}-${level}-${attempt}`}
            mode={mode}
            level={level}
            attempt={attempt}
            onGameEnd={handleGameEnd}
          />
        )}
        {screen === 'result' && lastResult && (
          <ResultScreen
            mode={lastResult.mode}
            level={lastResult.level}
            wpm={lastResult.wpm}
            accuracy={lastResult.accuracy}
            requiredWPM={lastResult.requiredWPM}
            passed={lastResult.passed}
            onNext={handleNext}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}
        {screen === 'progress' && (
          <ProgressScreen
            getHistoryForMode={getHistoryForMode}
            currentLevels={currentLevels}
            onBack={handleHome}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
