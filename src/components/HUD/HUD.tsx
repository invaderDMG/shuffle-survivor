import { useGame } from '../../game/GameProvider';
import Hearts from './Hearts';
import StreakMeter from './StreakMeter';
import './HUD.css';              // ✅ Main styles
import './StreakMeter.css';      // ✅ StreakMeter styles (if you have this)
// import './HUD-animations.css'; // ✅ Optional enhanced animations

export default function HUD() {
  const { state } = useGame();
  
  const minutes = Math.floor(state.elapsedMs / 60_000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((state.elapsedMs % 60_000) / 1_000)
    .toString()
    .padStart(2, '0');

  return (
    <div className="hud" data-testid="game-hud">
      <Hearts lives={state.lives} />
      <StreakMeter streak={state.streak} />
      <div className="timer" data-testid="game-timer">
        {minutes}:{seconds}
      </div>
      <div className="status" data-testid="game-status">
        Status: {state.status}
      </div>
    </div>
  );
}
