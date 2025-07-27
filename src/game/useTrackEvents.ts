import { useEffect } from 'react';
import { useGame } from './GameProvider';
import { dbg } from '../utils/debug';

export function useTrackEvents(player: Spotify.Player | null) {
  const { dispatch, state } = useGame();

  useEffect(() => {
    if (!player) return;

    let lastTrackId: string | null = null;
    let trackStartTime = 0;

    const handlePlayerStateChanged = (state: Spotify.PlaybackState | null) => {
      if (!state || !state.track_window.current_track) return;

      const currentTrack = state.track_window.current_track;
      const currentTime = Date.now();

      // Detect if this is a new track
      if (lastTrackId !== currentTrack.id) {
        dbg('🎵 New track detected', {
          trackName: currentTrack.name,
          artists: currentTrack.artists.map(a => a.name).join(', '),
          trackId: currentTrack.id
        });

        // If we had a previous track, determine if it was skipped
        if (lastTrackId) {
          const playDuration = currentTime - trackStartTime;
          const wasSkipped = playDuration < 30000; // Less than 30 seconds = skip
          
          dbg(wasSkipped ? '⏭️ Track was skipped' : '✅ Track played fully', {
            playDuration: `${Math.round(playDuration / 1000)}s`,
            wasSkipped
          });

          dispatch({
            type: 'TRACK_END',
            skipped: wasSkipped,
            trackId: lastTrackId
          });
        }

        lastTrackId = currentTrack.id;
        trackStartTime = currentTime;
      }
    };

    player.addListener('player_state_changed', handlePlayerStateChanged);

    return () => {
      player.removeListener('player_state_changed', handlePlayerStateChanged);
    };
  }, [player, dispatch]);

  useEffect(() => {
    if (!player) return;

    if (state.status === 'game-over') {
      dbg('🛑 Game over - stopping music playback');
      // Pause the player immediately
      player.disconnect().then(() => {
        dbg('⏸️ Music paused successfully on game over');
      }).catch((err) => {
        dbg('❌ Error pausing music on game over', err);
      });
    }
  }, [player, state.status]);
}
