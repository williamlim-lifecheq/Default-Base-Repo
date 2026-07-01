import { useReducer, useEffect, useRef, useCallback } from 'react';

const initialState = {
  phase: 'idle', // idle | countdown | active | finished
  typed: '',
  startTime: null,
  elapsed: 0,
  remaining: 0,
  passageIndex: 0,
  totalCorrectChars: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_COUNTDOWN':
      return {
        ...initialState,
        phase: 'countdown',
        remaining: action.timerSeconds,
      };
    case 'START_ACTIVE':
      return { ...state, phase: 'active', startTime: action.now };
    case 'TICK': {
      const elapsed = Math.floor((action.now - state.startTime) / 1000);
      const remaining = Math.max(0, action.timerSeconds - elapsed);
      return { ...state, elapsed, remaining };
    }
    case 'TYPE': {
      const newTyped = action.value;
      const currentPassage = action.passages[state.passageIndex];
      if (newTyped.length >= currentPassage.length) {
        const correct = newTyped
          .split('')
          .filter((c, i) => i < currentPassage.length && c === currentPassage[i]).length;
        const nextIndex = (state.passageIndex + 1) % action.passages.length;
        return {
          ...state,
          typed: '',
          passageIndex: nextIndex,
          totalCorrectChars: state.totalCorrectChars + correct,
        };
      }
      return { ...state, typed: newTyped };
    }
    case 'FINISH':
      return { ...state, phase: 'finished' };
    case 'RESET':
      return { ...initialState, remaining: action.timerSeconds };
    default:
      return state;
  }
}

export function useTypingGame({ passages, timerSeconds }) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    remaining: timerSeconds,
  });

  const intervalRef = useRef(null);
  const inputRef = useRef(null);

  const currentPassage = passages[state.passageIndex] ?? passages[0];
  const chars = currentPassage.split('');
  const typedChars = state.typed.split('');

  const currentPassageCorrectChars = typedChars.filter(
    (c, i) => c === chars[i],
  ).length;

  const totalCorrect = state.totalCorrectChars + currentPassageCorrectChars;

  const wpm =
    state.elapsed >= 3
      ? Math.round((totalCorrect / 5) / (state.elapsed / 60))
      : 0;

  const accuracy =
    state.typed.length + state.totalCorrectChars > 0
      ? totalCorrect / (state.typed.length + state.totalCorrectChars)
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
      dispatch({ type: 'TICK', now: Date.now(), timerSeconds });
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
      dispatch({ type: 'TYPE', value: e.target.value, passages });
    },
    [state.phase, passages],
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
    passageIndex: state.passageIndex,
    totalCorrectChars: state.totalCorrectChars,
    wpm,
    accuracy,
    charStatuses,
    cursorPosition,
    currentPassageCorrectChars,
    inputRef,
    startCountdown,
    startActive,
    onInput,
    reset,
  };
}
