import { useContext } from 'react';
import { PlayerCtx } from '../../spotify/PlayerProvider';
import { useGame } from '../../game/GameProvider';
import { dbg } from '../../utils/debug';

export default function SkipControls() {
  const player = useContext(PlayerCtx);
  const { dispatch, state } = useGame();

  const handleSkipNext = async () => {
    if (!player) return;
    
    try {
      // Disparar acción TRACK_END con skipped: true para reducir vidas ANTES del skip
      dispatch({
        type: 'TRACK_END',
        skipped: true,
        trackId: state.lastTrackId || 'unknown'
      });
      dbg('⏭️ User skipped to next track - life lost');
      
      // Hacer skip al siguiente track
      await player.nextTrack();
    } catch (err) {
      dbg('❌ Skip next error', err);
    }
  };

  return (
    <div className="skip-controls" data-testid="skip-controls">
      <button 
        onClick={handleSkipNext}
        className="control-button next"
        aria-label="Next track (lose a life)"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}
