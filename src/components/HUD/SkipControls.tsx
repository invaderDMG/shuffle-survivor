import { useContext } from 'react';
import { PlayerCtx } from '../../spotify/PlayerProvider';
import { dbg } from '../../utils/debug';

export default function SkipControls() {
  const player = useContext(PlayerCtx);

  const handleSkipNext = async () => {
    if (!player) return;
    
    try {
      await player.nextTrack();
      dbg('⏭️ User skipped to next track');
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
