import { useEffect, useContext, useState, useRef } from 'react';
import { PlayerCtx } from '../spotify/PlayerProvider';
import { useGame } from '../game/GameProvider';
import { useTrackEvents } from '../game/useTrackEvents';
import { dbg } from '../utils/debug';

export type GameInitState = 
  | { status: 'loading'; message: string }
  | { status: 'ready'; playlistName: string; playlistImage: string }
  | { status: 'playing' }
  | { status: 'error'; message: string };

export function useGameInit() {
  const player = useContext(PlayerCtx);
  const { dispatch, state } = useGame();
  const [initState, setInitState] = useState<GameInitState>({ 
    status: 'loading', 
    message: 'Initializing...' 
  });
  const isInitializingRef = useRef(false);
  
  const token = sessionStorage.getItem('access_token');

  // Connect track events to game logic
  useTrackEvents(player);

  // Initialize game when player is ready
  useEffect(() => {
    const checkPrerequisites = () => {
      // 1. Verificar token
      if (!token) {
        console.log('1️⃣ No access token');
        setInitState({ status: 'error', message: 'No access token' });
        return false;
      }
  
      // 2. Verificar player
      if (!player) {
        console.log('2️⃣ No player');
        setInitState({ status: 'loading', message: 'Connecting to Spotify...' });
        return false;
      }
  
      // 3. Verificar device ID
      const deviceId = sessionStorage.getItem('device_id');
      if (!deviceId) {
        console.log('3️⃣ No device ID');
        setInitState({ status: 'loading', message: 'Setting up device...' });
        return false;
      }
  
      // 4. Verificar si ya tenemos playlist
      const existingPlaylist = sessionStorage.getItem('playlist_name');
      if (!existingPlaylist) {
        console.log('4️⃣ No playlist');
        loadPlaylist();
      }
  
      // 5. Si llegamos aquí, necesitamos inicializar playlist
      const hasPlaylistData = sessionStorage.getItem('game_playlist_uri') && 
                       sessionStorage.getItem('playlist_name');

      if (!hasPlaylistData) {
        console.log('5️⃣ No initialized playlist');
        initializePlaylist();
      }
      
      dbg('✅ Prerequisites met');
      return true;
    };
  
    // Ejecutar comprobación inmediatamente
    checkPrerequisites();
  
    // Configurar polling cada 500ms para verificar cambios
    const interval = setInterval(() => {
      checkPrerequisites();
    }, 500);
  
    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, [token, player]); // Solo estas dependencias

  const loadPlaylist = async () => {
    if (!token || !player) {
      dbg('❌ Cannot load playlist - missing token or player');
      return null;
    }
  
    try {
      dbg('�� Loading playlists from Spotify...');
      
      const deviceId = sessionStorage.getItem('device_id')!;
      
      // 1. Transferir playback al dispositivo (pero no empezar a reproducir)
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [deviceId], play: false }),
      });
  
      dbg('✅ Playback transferred to device');
  
      // 2. Obtener playlists del usuario
      const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!playlistsResponse.ok) {
        throw new Error(`Failed to fetch playlists: ${playlistsResponse.status}`);
      }
  
      const { items } = await playlistsResponse.json();
      if (!items.length) {
        throw new Error('No playlists found');
      }
  
      dbg(`📚 Found ${items.length} playlists`);
  
      // 3. Seleccionar playlist aleatoria
      const selectedPlaylist = items[Math.floor(Math.random() * items.length)];
      
      dbg('�� Selected random playlist:', selectedPlaylist.name);
  
      // 4. Activar shuffle mode
      await fetch('https://api.spotify.com/v1/me/player/shuffle?state=true', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
  
      dbg('🔀 Shuffle mode enabled');
  
      // 5. Retornar datos de la playlist
      return {
        uri: selectedPlaylist.uri,
        name: selectedPlaylist.name,
        image: selectedPlaylist.images[0]?.url || '',
        trackCount: selectedPlaylist.tracks?.total || 0
      };
  
    } catch (error) {
      dbg('❌ Error loading playlist:', error);
      throw error;
    }
  };

  const initializePlaylist = async () => {
    try {
      dbg('🎵 Initializing playlist...');
      setInitState({ status: 'loading', message: 'Loading your playlists...' });
      
      // Cargar datos de la playlist
      const playlistData = await loadPlaylist();
      
      if (!playlistData) {
        throw new Error('Failed to load playlist data');
      }
  
      // Almacenar información en sessionStorage
      sessionStorage.setItem('game_playlist_uri', playlistData.uri);
      sessionStorage.setItem('playlist_name', playlistData.name);
      sessionStorage.setItem('playlist_image', playlistData.image);
  
      // Actualizar estado a 'ready'
      setInitState({
        status: 'ready',
        playlistName: playlistData.name,
        playlistImage: playlistData.image
      });
  
      dbg('✅ Playlist ready:', playlistData.name);
  
    } catch (error) {
      dbg('❌ Playlist initialization error:', error);
      setInitState({ 
        status: 'error', 
        message: `Failed to load playlists: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  const startGame = async () => {
    if (initState.status !== 'ready') return;

    try {
      setInitState({ status: 'loading', message: 'Starting game...' });
      
      const deviceId = sessionStorage.getItem('device_id')!;
      const playlistUri = sessionStorage.getItem('game_playlist_uri')!;
      
      // Initialize game state
      dispatch({ type: 'INIT', playlistUri });
      
      // Wait a moment for device transfer
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start playback
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context_uri: playlistUri }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Try to resume on Web Playback SDK
      if (player) {
        try {
          await player.resume();
        } catch (err) {
          dbg('⚠️ Could not call player.resume()', err);
        }
      }

      setInitState({ status: 'playing' });
      dbg('🎵 Game started successfully');
    } catch (error) {
      dbg('❌ Game start error:', error);
      setInitState({ 
        status: 'error', 
        message: `Failed to start game: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET' });
    sessionStorage.removeItem('game_playlist_uri');
    sessionStorage.removeItem('playlist_name');
    sessionStorage.removeItem('playlist_image');
    sessionStorage.removeItem('device_id');
    sessionStorage.removeItem('spotify_sdk_initializing');
    setInitState({ status: 'loading', message: 'Initializing...' });
    // Force a page reload to reset everything cleanly
    window.location.reload();
  };

  // Debug info for troubleshooting
  const debugInfo = {
    hasToken: !!token,
    hasPlayer: !!player,
    deviceId: sessionStorage.getItem('device_id'),
    playlistUri: sessionStorage.getItem('game_playlist_uri'),
    gameStatus: state.status,
    initStatus: initState.status,
    isInitializing: isInitializingRef.current
  };

  // Log debug info in development
  if (process.env.NODE_ENV === 'development') {
    dbg('🔍 Game Init Debug Info', debugInfo);
  }

  return {
    initState,
    startGame,
    resetGame,
    isReady: initState.status === 'ready',
    isPlaying: initState.status === 'playing',
    isLoading: initState.status === 'loading',
    hasError: initState.status === 'error',
    debugInfo
  };
}
