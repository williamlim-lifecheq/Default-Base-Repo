import styles from './TextDisplay.module.css';

export function TextDisplay({ passage, charStatuses, cursorPosition }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.text}>
        {passage.split('').map((char, i) => (
          <span
            key={i}
            className={[
              styles.char,
              styles[charStatuses[i]] ?? '',
              i === cursorPosition ? styles.cursor : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {char}
          </span>
        ))}
      </p>
    </div>
  );
}
