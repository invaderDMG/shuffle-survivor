import { useEffect, useRef } from 'react';
import { useGame } from './GameProvider';
import { dbg } from '../utils/debug';

export function useTrackEvents(player: Spotify.Player | null) {
  const { dispatch, state } = useGame();
  
  // Use refs to persist tracking variables across renders
  const trackingRef = useRef({
    lastTrackId: null as string | null,
    trackStartTime: 0,
    lastTrackDuration: 0,
    lastTrackPosition: 0,
    trackCompletionTimeout: null as ReturnType<typeof setTimeout> | null,
    gameInitialized: false
  });

  // Reset tracking variables when game resets
  useEffect(() => {
    if (state.status === 'idle') {
      dbg('🔄 Game reset - clearing track tracking variables');
      // Reset all tracking variables
      trackingRef.current = {
        lastTrackId: null,
        trackStartTime: 0,
        lastTrackDuration: 0,
        lastTrackPosition: 0,
        trackCompletionTimeout: null,
        gameInitialized: false
      };
    } else if (state.status === 'playing') {
      dbg('🎮 Game started - initializing track events');
    }
  }, [state.status]);

  useEffect(() => {
    if (!player) return;

    // Use the ref values for tracking
    const tracking = trackingRef.current;

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

    const handlePlayerStateChanged = (playbackState: Spotify.PlaybackState | null) => {
      if (!playbackState || !playbackState.track_window.current_track) {
        dbg('⚠️ No state or current track available');
        return;
      }

      const currentTrack = playbackState.track_window.current_track;

      // Detect if this is a new track
      if (tracking.lastTrackId !== currentTrack.id) {
        dbg('🎵 New track detected', {
          trackName: currentTrack.name,
          artists: currentTrack.artists.map((a: any) => a.name).join(', '),
          trackId: currentTrack.id,
          isFirstTrack: tracking.lastTrackId === null,
          isPaused: playbackState.paused,
          duration: playbackState.duration
        });

        // El logging de vidas se hace en el useEffect separado

        // Update tracking
        tracking.lastTrackId = currentTrack.id;
        tracking.trackStartTime = Date.now();
        tracking.lastTrackDuration = playbackState.duration || 0;
        tracking.lastTrackPosition = playbackState.position || 0;
        
        // Mark game as initialized after the first track is processed
        if (!tracking.gameInitialized) {
          tracking.gameInitialized = true;
          dbg('🎮 Game initialized - track tracking is now active');
        }

      } else {
        // Same track, update position info
        tracking.lastTrackPosition = playbackState.position || 0;
        tracking.lastTrackDuration = playbackState.duration || 0;
      }
    };

    player.addListener('player_state_changed', handlePlayerStateChanged);

    return () => {
      player.removeListener('player_state_changed', handlePlayerStateChanged);
      if (tracking.trackCompletionTimeout) {
        clearTimeout(tracking.trackCompletionTimeout);
        tracking.trackCompletionTimeout = null;
      }
    };
  }, [player, dispatch]);

  // Log vidas cuando cambien
  useEffect(() => {
    if (state.status === 'playing') {
      console.log(`💖 Vidas disponibles: ${state.lives}`);
      dbg(`💖 Vidas disponibles: ${state.lives}`);
    }
  }, [state.lives, state.status]);

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
