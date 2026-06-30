import { useReducer, useEffect, useRef, useCallback } from 'react';

const initialState = {
  phase: 'idle', // idle | countdown | active | finished
  typed: '',
  startTime: null,
  elapsed: 0,
  remaining: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_COUNTDOWN':
      return { ...state, phase: 'countdown', typed: '', elapsed: 0, remaining: action.timerSeconds };
    case 'START_ACTIVE':
      return { ...state, phase: 'active', startTime: action.now };
    case 'TICK': {
      const elapsed = Math.floor((action.now - state.startTime) / 1000);
      const remaining = Math.max(0, action.timerSeconds - elapsed);
      return { ...state, elapsed, remaining };
    }
    case 'FINISH':
      return { ...state, phase: 'finished' };
    case 'TYPE':
      return { ...state, typed: action.value };
    case 'RESET':
      return { ...initialState, remaining: action.timerSeconds };
    default:
      return state;
  }
}

export function useTypingGame({ passage, timerSeconds }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    remaining: timerSeconds,
  });

  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  const chars = passage.split('');
  const typedChars = state.typed.split('');

  const correctCount = typedChars.filter((c, i) => c === chars[i]).length;
  const wpm =
    state.elapsed >= 3
      ? Math.round((correctCount / 5) / (state.elapsed / 60))
      : 0;
  const accuracy =
    state.typed.length > 0
      ? correctCount / state.typed.length
      : 1.0;

  const charStatuses = chars.map((char, i) => {
    if (i >= typedChars.length) return 'pending';
    return typedChars[i] === char ? 'correct' : 'incorrect';
  });

  const cursorPosition = state.typed.length;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    dispatch({ type: 'START_COUNTDOWN', timerSeconds });
  }, [timerSeconds]);

  const startActive = useCallback(() => {
    const now = Date.now();
    dispatch({ type: 'START_ACTIVE', now });
    intervalRef.current = setInterval(() => {
      const currentNow = Date.now();
      dispatch({ type: 'TICK', now: currentNow, timerSeconds });
    }, 250);
    if (inputRef.current) inputRef.current.focus();
  }, [timerSeconds]);

  useEffect(() => {
    if (state.phase === 'active' && state.remaining === 0) {
      clearTimer();
      dispatch({ type: 'FINISH' });
    }
  }, [state.phase, state.remaining, clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const onInput = useCallback(
    (e) => {
      if (state.phase !== 'active') return;
      dispatch({ type: 'TYPE', value: e.target.value });
    },
    [state.phase],
  );

  const reset = useCallback(() => {
    clearTimer();
    dispatch({ type: 'RESET', timerSeconds });
  }, [clearTimer, timerSeconds]);

  return {
    phase: state.phase,
    typed: state.typed,
    elapsed: state.elapsed,
    remaining: state.remaining,
    wpm,
    accuracy,
    charStatuses,
    cursorPosition,
    correctCount,
    inputRef,
    startCountdown,
    startActive,
    onInput,
    reset,
  };
}
