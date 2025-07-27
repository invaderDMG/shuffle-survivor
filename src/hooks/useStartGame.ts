import { useEffect, useContext, useState } from 'react';
import { PlayerCtx } from '../spotify/PlayerProvider';
import { useGame } from '../game/GameProvider';
import { useTrackEvents } from '../game/useTrackEvents';
import { dbg } from '../utils/debug';

export function useStartGame() {
  const player = useContext(PlayerCtx);
  const { dispatch, state } = useGame();
  const [gameReady, setGameReady] = useState(false);
  const [playlistReady, setPlaylistReady] = useState(false);
  const token = sessionStorage.getItem('access_token')!;

  // Connect track events to game logic
  useTrackEvents(player);

  // Initialize playlist but don't start playback yet
  useEffect(() => {
    const deviceId = sessionStorage.getItem('device_id');
    if (!player || !token || !deviceId || playlistReady) return;

    (async () => {
      try {
        dbg('🎮 Preparing game (no playback yet)');

        // 0. Transfer playback
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: [deviceId], play: false }),
        });

        // 1. Fetch playlists and select one
        const pls = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { items } = await pls.json();
        if (!items.length) throw new Error('No playlists');

        const playlist = items[Math.floor(Math.random() * items.length)];
        const { uri } = playlist;
        
        // 2. Initialize game state
        dispatch({ type: 'INIT', playlistUri: uri });
        
        // 3. Enable shuffle (but don't play yet)
        await fetch('https://api.spotify.com/v1/me/player/shuffle?state=true', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });

        // Store playlist URI for later playback
        sessionStorage.setItem('game_playlist_uri', uri);
        setPlaylistReady(true);
        
        dbg('🏁 Game prepared, waiting for user interaction');
      } catch (err) {
        dbg('❌ useStartGame preparation error', err);
      }
    })();
  }, [player, token, dispatch, playlistReady]);

  // Function to start actual playback (call this on user interaction)
  const startPlayback = async () => {
    const deviceId = sessionStorage.getItem('device_id');
    const playlistUri = sessionStorage.getItem('game_playlist_uri');
    
    if (!playlistUri || gameReady) return;

    try {
      dbg('▶️ Starting playback after user interaction');
      
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context_uri: playlistUri }),
      });

      setGameReady(true);
      dbg('🎵 Playback started successfully');
    } catch (err) {
      dbg('❌ Playback start error', err);
    }
  };

  return { 
    gameReady, 
    playlistReady, 
    startPlayback,
    canStartGame: playlistReady && !gameReady 
  };
}
