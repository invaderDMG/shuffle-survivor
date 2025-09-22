import { useGame } from '../../game/GameProvider';
import Hearts from './Hearts';
import StreakMeter from './StreakMeter';
import './HUD.css';

export default function HUD() {
  const { state } = useGame();
  
  // Debug logs
  console.log('HUD Debug:', {
    status: state.status,
    elapsedTime: state.elapsedTime,
    lives: state.lives,
    streak: state.streak
  });
  
  const minutes = Math.floor(state.elapsedTime / 60_000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((state.elapsedTime % 60_000) / 1_000)
    .toString()
    .padStart(2, '0');

  return (
    <div className="hud" data-testid="game-hud">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="25%" stopColor="#ff8e8e" />
            <stop offset="50%" stopColor="#ffa8a8" />
            <stop offset="75%" stopColor="#ffb3b3" />
            <stop offset="100%" stopColor="#ffc0c0" />
          </linearGradient>
        </defs>
      </svg>
      <Hearts lives={state.lives} />
      <StreakMeter streak={state.streak} />
      <div className="timer" data-testid="game-timer">
        {minutes}:{seconds}
      </div>
    </div>
  );
}
