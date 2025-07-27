import clsx from 'clsx';

interface StreakMeterProps {
  streak: 0 | 1 | 2 | 3;
}

export default function StreakMeter({ streak }: StreakMeterProps) {
  return (
    <div className="streak-meter" data-testid="streak-meter">
      <div className="streak-label">Song Streak</div>
      <div className="streak-dots">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={clsx('streak-dot', { 
              filled: index < streak,
              active: index === streak - 1 && streak > 0
            })}
            data-testid={`streak-dot-${index}`}
            aria-label={index < streak ? 'Completed song' : 'Remaining song'}
          />
        ))}
      </div>
      <div className="streak-text" data-testid="streak-text">
        {streak}/3 {streak === 3 ? '🎉 Life Gained!' : 'songs to gain life'}
      </div>
    </div>
  );
}
