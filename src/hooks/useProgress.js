import { useState, useCallback } from 'react';

const PROGRESS_KEY = 'typingGame_progress';
const LEVEL_KEY = 'typingGame_currentLevel';

const DEFAULT_PROGRESS = { easy: [], medium: [], hard: [] };
const DEFAULT_LEVELS = { easy: 1, medium: 1, hard: 1 };

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage blocked (private mode, storage full)
  }
}

export function useProgress() {
  const [history, setHistory] = useState(() => readStorage(PROGRESS_KEY, DEFAULT_PROGRESS));
  const [currentLevels, setCurrentLevels] = useState(() => readStorage(LEVEL_KEY, DEFAULT_LEVELS));

  const recordResult = useCallback((mode, level, wpm, accuracy, passed) => {
    setHistory(prev => {
      const entry = { timestamp: Date.now(), level, wpm, accuracy, passed };
      const next = { ...prev, [mode]: [...(prev[mode] || []), entry] };
      writeStorage(PROGRESS_KEY, next);
      return next;
    });

    if (passed) {
      setCurrentLevels(prev => {
        const next = { ...prev, [mode]: Math.max(prev[mode] ?? 1, level + 1) };
        writeStorage(LEVEL_KEY, next);
        return next;
      });
    }
  }, []);

  const getHistoryForMode = useCallback(
    (mode) => (history[mode] || []).slice().sort((a, b) => a.timestamp - b.timestamp),
    [history],
  );

  const resetProgress = useCallback(() => {
    setHistory(DEFAULT_PROGRESS);
    setCurrentLevels(DEFAULT_LEVELS);
    writeStorage(PROGRESS_KEY, DEFAULT_PROGRESS);
    writeStorage(LEVEL_KEY, DEFAULT_LEVELS);
  }, []);

  return { history, currentLevels, recordResult, getHistoryForMode, resetProgress };
}
