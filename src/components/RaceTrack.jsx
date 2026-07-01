import styles from './RaceTrack.module.css';

export function RaceTrack({ playerPct, racers }) {
  const allRacers = [
    { name: 'You', emoji: '🏎️', color: 'var(--accent)', pct: playerPct, isPlayer: true },
    ...racers,
  ];

  return (
    <div className={styles.wrapper}>
      {allRacers.map((racer) => (
        <div
          key={racer.name}
          className={[styles.lane, racer.isPlayer ? styles.playerLane : ''].filter(Boolean).join(' ')}
        >
          <span className={styles.label}>{racer.name}</span>
          <div className={styles.track}>
            <div className={styles.finishLine} />
            <span
              className={styles.car}
              style={{ left: `calc(${Math.min(racer.pct, 98)}% - 1.2rem)` }}
              title={`${racer.name}: ${Math.round(racer.pct)}%`}
            >
              {racer.emoji}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
