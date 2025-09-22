import { useEffect } from 'react';
import { useGame } from './GameProvider';
import { dbg } from '../utils/debug';

export function useTrackEvents(player: Spotify.Player | null) {
  const { dispatch, state } = useGame();

  useEffect(() => {
    if (!player) return;

    let lastTrackId: string | null = null;
    let trackStartTime = 0;
    let lastTrackDuration = 0;
    let lastTrackPosition = 0;
    let trackCompletionTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleTrackEnd = (trackId: string, wasSkipped: boolean) => {
      dbg(wasSkipped ? '⏭️ Track was skipped' : '✅ Track played fully', {
        trackId,
        wasSkipped
      });

      dispatch({
        type: 'TRACK_END',
        skipped: wasSkipped,
        trackId: trackId
      });
    };

    const handlePlayerStateChanged = (state: Spotify.PlaybackState | null) => {
      

      if (!state || !state.track_window.current_track) {
        dbg('⚠️ No state or current track available');
        return;
      }

      const currentTrack = state.track_window.current_track;
      const currentTime = Date.now();

      // Detect if this is a new track
      if (lastTrackId !== currentTrack.id) {
        dbg('🎵 New track detected', {
          trackName: currentTrack.name,
          artists: currentTrack.artists.map((a: any) => a.name).join(', '),
          trackId: currentTrack.id,
          isFirstTrack: lastTrackId === null,
          isPaused: state.paused,
          duration: state.duration
        });

        // If we had a previous track, determine if it was skipped
        if (lastTrackId) {
          // Clear any pending completion timeout
          if (trackCompletionTimeout) {
            clearTimeout(trackCompletionTimeout);
            trackCompletionTimeout = null;
          }

          const playDuration = currentTime - trackStartTime;
          
          // More sophisticated skip detection:
          // 1. If played for less than 30 seconds, it's likely a skip
          // 2. If we have duration info and position is near the end, it's likely completed
          // 3. If we don't have duration info, use the 30-second rule
          let wasSkipped = playDuration < 30000; // Default: less than 30 seconds = skip
          
          if (lastTrackDuration > 0 && lastTrackPosition > 0) {
            // If we have duration info, check if we were near the end
            const completionPercentage = (lastTrackPosition / lastTrackDuration) * 100;
            const wasNearEnd = completionPercentage > 80; // Within 20% of the end
            
            if (wasNearEnd) {
              wasSkipped = false; // If we were near the end, it's likely completed
              dbg('🎯 Track was near completion, marking as played fully', {
                completionPercentage: `${completionPercentage.toFixed(1)}%`,
                position: lastTrackPosition,
                duration: lastTrackDuration
              });
            }
          }
          
          dbg('Track end analysis', {
            playDuration: `${Math.round(playDuration / 1000)}s`,
            wasSkipped,
            hadDurationInfo: lastTrackDuration > 0,
            lastPosition: lastTrackPosition,
            lastDuration: lastTrackDuration
          });

          handleTrackEnd(lastTrackId, wasSkipped);
        }

        lastTrackId = currentTrack.id;
        trackStartTime = currentTime;
        lastTrackDuration = state.duration || 0;
        lastTrackPosition = state.position || 0;

        // Set up completion timeout for this track
        if (lastTrackDuration > 0) {
          // Clear any existing timeout
          if (trackCompletionTimeout) {
            clearTimeout(trackCompletionTimeout);
          }
          
          // Set timeout to detect completion if track change doesn't fire
          const remainingTime = Math.max(0, lastTrackDuration - lastTrackPosition);
          trackCompletionTimeout = setTimeout(() => {
            dbg('⏰ Track completion timeout - marking as played fully', {
              trackId: lastTrackId,
              duration: lastTrackDuration,
              position: lastTrackPosition
            });
            if (lastTrackId) {
              handleTrackEnd(lastTrackId, false); // Mark as completed, not skipped
            }
          }, remainingTime + 2000); // Add 2 seconds buffer
        }

        // For the first track, also check if it's paused and resume it
        if (lastTrackId === currentTrack.id && state.paused) {
          dbg('⚠️ First track is paused - resuming automatically...');
          if (player) {
            player.resume().then(() => {
              dbg('✅ First track resumed successfully');
            }).catch((err: any) => {
              dbg('❌ Error resuming first track:', err);
            });
          }
        }
      } else {
        // Same track, update position info for better skip detection
        lastTrackPosition = state.position || 0;
        lastTrackDuration = state.duration || 0;
        
        // Update completion timeout if we have duration info
        if (lastTrackDuration > 0 && lastTrackId) {
          // Clear existing timeout
          if (trackCompletionTimeout) {
            clearTimeout(trackCompletionTimeout);
          }
          
          // Set new timeout based on current position
          const remainingTime = Math.max(0, lastTrackDuration - lastTrackPosition);
          trackCompletionTimeout = setTimeout(() => {
            dbg('⏰ Track completion timeout - marking as played fully', {
              trackId: lastTrackId,
              duration: lastTrackDuration,
              position: lastTrackPosition
            });
            if (lastTrackId) {
              handleTrackEnd(lastTrackId, false); // Mark as completed, not skipped
            }
          }, remainingTime + 2000); // Add 2 seconds buffer
        }
      }
    };

    player.addListener('player_state_changed', handlePlayerStateChanged);

    return () => {
      player.removeListener('player_state_changed', handlePlayerStateChanged);
      if (trackCompletionTimeout) {
        clearTimeout(trackCompletionTimeout);
        trackCompletionTimeout = null;
      }
    };
  }, [player, dispatch]);

  useEffect(() => {
    if (!player) return;

    if (state.status === 'game-over') {
      dbg('🛑 Game over - stopping music playback');
      // Pause the player immediately
      player.disconnect().then(() => {
        dbg('⏸️ Music paused successfully on game over');
      }).catch((err: any) => {
        dbg('❌ Error pausing music on game over', err);
      });
    }
  }, [player, state.status]);
}
