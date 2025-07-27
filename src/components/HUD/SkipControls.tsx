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

  const handleSkipPrevious = async () => {
    if (!player) return;
    
    try {
      await player.previousTrack();
      dbg('⏮️ User skipped to previous track');
    } catch (err) {
      dbg('❌ Skip previous error', err);
    }
  };

  const handleTogglePlay = async () => {
    if (!player) return;
    
    try {
      await player.togglePlay();
      dbg('⏸️▶️ User toggled play/pause');
    } catch (err) {
      dbg('❌ Toggle play error', err);
    }
  };

  return (
    <div className="skip-controls" data-testid="skip-controls">
      <button 
        onClick={handleSkipPrevious}
        className="control-button previous"
        aria-label="Previous track"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        onClick={handleTogglePlay}
        className="control-button play-pause"
        aria-label="Play/Pause"
      >
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path d="M8 5v14l11-7z" fill="currentColor"/>
        </svg>
      </button>
      
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
