import clsx from 'clsx';

interface HeartsProps {
  lives: number;
}

export default function Hearts({ lives }: HeartsProps) {
  return (
    <div className="hearts" data-testid="hearts-container">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={clsx('heart', { lost: index >= lives })}
          viewBox="0 0 32 29.6"
          data-testid={`heart-${index}`}
          role="img"
          aria-label={index < lives ? 'Full heart' : 'Empty heart'}
        >
          <path d="M23.6,0c-2.8,0-5.4,1.4-7.6,4.1C13.8,1.4,11.2,0,8.4,0C3.6,0,0,3.6,0,8.4 c0,9.8,16,21.1,16,21.1s16-11.3,16-21.1C32,3.6,28.4,0,23.6,0z" />
        </svg>
      ))}
    </div>
  );
}
