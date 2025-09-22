import { useState, useEffect, useContext } from 'react';
import { PlayerCtx } from '../spotify/PlayerProvider';
import { useGame } from '../game/GameProvider';
import { useTrackEvents } from '../game/useTrackEvents';
import { dbg } from '../utils/debug';

export type AppState = 
  | { status: 'loading'; message: string; progress: number; subMessage?: string }
  | { status: 'ready'; playlistName: string; playlistImage: string }
  | { status: 'playing' }
  | { status: 'error'; message: string };

export function useAppInitialization() {
  const player = useContext(PlayerCtx);
  const { state } = useGame();
  const [appState, setAppState] = useState<AppState>({ 
    status: 'loading', 
    message: 'Iniciando aplicación...', 
    progress: 0 
  });
  
  const token = sessionStorage.getItem('access_token');

  // Conectar eventos de track
  useTrackEvents(player);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Paso 1: Verificar token
        if (!token) {
          setAppState({ status: 'error', message: 'No se encontró token de acceso' });
          return;
        }
        setAppState({ status: 'loading', message: 'Conectando con Spotify...', progress: 20 });

        // Paso 2: Esperar player
        if (!player) {
          setAppState({ status: 'loading', message: 'Inicializando reproductor...', progress: 40 });
          return;
        }
        setAppState({ status: 'loading', message: 'Configurando dispositivo...', progress: 60 });

        // Paso 3: Esperar device ID con polling ligero
        const waitForDeviceId = () => {
          return new Promise<string>((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 20; // 10 segundos máximo
            
            const checkDeviceId = () => {
              const deviceId = sessionStorage.getItem('device_id');
              if (deviceId) {
                resolve(deviceId);
                return;
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                reject(new Error('Timeout esperando device ID'));
                return;
              }
              
              setTimeout(checkDeviceId, 500);
            };
            
            checkDeviceId();
          });
        };

        const deviceId = await waitForDeviceId();
        setAppState({ status: 'loading', message: 'Cargando playlists...', progress: 80 });

        // Paso 4: Verificar si ya tenemos playlist
        const existingPlaylist = sessionStorage.getItem('playlist_name');
        if (existingPlaylist) {
          setAppState({
            status: 'ready',
            playlistName: existingPlaylist,
            playlistImage: sessionStorage.getItem('playlist_image') || ''
          });
          return;
        }

        // Paso 5: Cargar playlist
        await loadPlaylist();
        setAppState({ status: 'loading', message: 'Finalizando configuración...', progress: 100 });

        // Pequeña pausa para mostrar el 100%
        setTimeout(() => {
          const playlistName = sessionStorage.getItem('playlist_name');
          const playlistImage = sessionStorage.getItem('playlist_image');
          if (playlistName) {
            setAppState({
              status: 'ready',
              playlistName,
              playlistImage: playlistImage || ''
            });
          }
        }, 500);

      } catch (error) {
        dbg('❌ Error en inicialización:', error);
        setAppState({ 
          status: 'error', 
          message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` 
        });
      }
    };

    initializeApp();
  }, [token, player]); // Solo estas dependencias

  const loadPlaylist = async () => {
    if (!token || !player) return;

    try {
      const deviceId = sessionStorage.getItem('device_id')!;
      
      // Transferir playback al dispositivo
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [deviceId], play: false }),
      });

      // Obtener playlists
      const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!playlistsResponse.ok) {
        throw new Error(`Error al cargar playlists: ${playlistsResponse.status}`);
      }

      const { items } = await playlistsResponse.json();
      if (!items.length) {
        throw new Error('No se encontraron playlists');
      }

      // Seleccionar playlist aleatoria
      const selectedPlaylist = items[Math.floor(Math.random() * items.length)];
      
      // Activar shuffle
      await fetch('https://api.spotify.com/v1/me/player/shuffle?state=true', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Guardar datos de playlist
      sessionStorage.setItem('game_playlist_uri', selectedPlaylist.uri);
      sessionStorage.setItem('playlist_name', selectedPlaylist.name);
      sessionStorage.setItem('playlist_image', selectedPlaylist.images[0]?.url || '');

      dbg('✅ Playlist cargada:', selectedPlaylist.name);

    } catch (error) {
      dbg('❌ Error cargando playlist:', error);
      throw error;
    }
  };

  const startGame = async () => {
    if (appState.status !== 'ready') return;

    try {
      setAppState({ status: 'loading', message: 'Iniciando juego...', progress: 50 });
      
      const deviceId = sessionStorage.getItem('device_id')!;
      const playlistUri = sessionStorage.getItem('game_playlist_uri')!;
      
      // Inicializar estado del juego
      // const { dispatch } = useGame();
      // dispatch({ type: 'INIT', playlistUri });
      
      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Iniciar reproducción
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
        throw new Error(`Error de Spotify: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Intentar reanudar en Web Playback SDK
      if (player) {
        try {
          await player.resume();
        } catch (err) {
          dbg('⚠️ No se pudo llamar player.resume()', err);
        }
      }

      setAppState({ status: 'playing' });
      dbg('🎵 Juego iniciado exitosamente');

    } catch (error) {
      dbg('❌ Error iniciando juego:', error);
      setAppState({ 
        status: 'error', 
        message: `Error iniciando juego: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    }
  };

  const resetApp = () => {
    // Limpiar sessionStorage
    sessionStorage.removeItem('game_playlist_uri');
    sessionStorage.removeItem('playlist_name');
    sessionStorage.removeItem('playlist_image');
    sessionStorage.removeItem('device_id');
    sessionStorage.removeItem('spotify_sdk_initializing');
    
    // Recargar página
    window.location.reload();
  };

  return {
    appState,
    startGame,
    resetApp,
    isReady: appState.status === 'ready',
    isPlaying: appState.status === 'playing',
    isLoading: appState.status === 'loading',
    hasError: appState.status === 'error'
  };
}
