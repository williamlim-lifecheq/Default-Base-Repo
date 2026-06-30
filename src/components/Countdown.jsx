import { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

const SEQUENCE = [3, 2, 1, 'GO'];

export function Countdown({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= SEQUENCE.length) {
      onComplete();
      return;
    }
    const id = setTimeout(() => setStep(s => s + 1), 1000);
    return () => clearTimeout(id);
  }, [step, onComplete]);

  if (step >= SEQUENCE.length) return null;

  const current = SEQUENCE[step];
  return (
    <div className={styles.overlay}>
      <span className={[styles.number, current === 'GO' ? styles.go : ''].filter(Boolean).join(' ')}>
        {current}
      </span>
    </div>
  );
}
