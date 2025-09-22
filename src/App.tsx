import { useState, useEffect } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useGame } from './game/GameProvider';
import PlayerProvider from './spotify/PlayerProvider';
import GameProvider from './game/GameProvider';
import HUD from './components/HUD/HUD';
import SkipControls from './components/HUD/SkipControls';
import LoadingScreen from './components/LoadingScreen';
import { dbg } from './utils/debug';
import './App.css';

function App() {
  const { login } = useSpotifyAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    const expiresAt = sessionStorage.getItem('expires_at');
    
    if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      setToken(storedToken);
    }
  }, []);

  if (!token) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎵 Road Trip Shuffle Survivor</h1>
          <p>Gamify your Spotify listening with a lives system!</p>
          <button onClick={login} className="login-button">
            Login with Spotify
          </button>
        </header>
      </div>
    );
  }

  return (
    <GameProvider>
      <PlayerProvider>
        <GameInterface />
      </PlayerProvider>
    </GameProvider>
  );
}

function GameInterface() {
  const { state } = useGame();
  const { 
    appState, 
    startGame, 
    resetApp, 
    isReady, 
    isPlaying, 
    isLoading, 
    hasError
  } = useAppInitialization();

  // Pantalla de carga
  if (isLoading) {
    return (
      <LoadingScreen
        message={appState.status === 'loading' ? appState.message : 'Cargando...'}
        progress={appState.status === 'loading' ? appState.progress : 0}
        subMessage={appState.status === 'loading' ? appState.subMessage : undefined}
      />
    );
  }

  // Estado de error
  if (hasError) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎵 Shuffle Survivor</h1>
          <p>❌ {appState.status === 'error' ? appState.message : 'Algo salió mal'}</p>
          <button onClick={resetApp} className="retry-button">
            🔄 Intentar de nuevo
          </button>
        </header>
      </div>
    );
  }

  // Estado listo para empezar
  if (isReady) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎵 Shuffle Survivor</h1>
          <button onClick={startGame} className="start-game-button">
            🎵 Intenta sobrevivir a tu playlist
          </button>
          <img
            src={appState.status === 'ready' ? appState.playlistImage : 'placeholder.png'}
            alt="Portada de playlist"
            className="playlist-cover"
            width={300}
            height={300}
          />
          <p>
            Playlist: {appState.status === 'ready' ? appState.playlistName : 'Cargando...'}
          </p>
          <div className="game-rules">
            <h3>Reglas:</h3>
            <p>• Empiezas con 5 vidas ❤️</p>
            <p>• Saltar una canción = perder una vida 💔</p>
            <p>• Escuchar 3 canciones completas = ganar una vida ✨</p>
            <p>• Game over cuando llegues a 0 vidas ☠️</p>
          </div>
        </header>
      </div>
    );
  }

  // Estado de game over
  if (state.status === 'game-over') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>💀 ¡Game Over!</h1>
          <p>Sobreviviste por {Math.floor(state.elapsedTime / 1000)} segundos</p>
          <button onClick={resetApp} className="retry-button">
            🔄 Jugar de nuevo
          </button>
        </header>
      </div>
    );
  }

  // Estado de juego activo
  if (isPlaying && state.status === 'playing') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎵 Shuffle Survivor</h1>
          <HUD />
          <SkipControls />
          <div className="game-controls">
            <p>🎯 Usa el botón de saltar para perder vidas • Escucha 3 canciones completas para ganar una vida</p>
            <button onClick={resetApp} className="new-game-button">
              🔄 Nuevo Juego
            </button>
          </div>
        </header>
      </div>
    );
  }

  // Fallback - no debería llegar aquí
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Shuffle Survivor</h1>
        <p>Algo inesperado pasó. Por favor recarga la página.</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          🔄 Recargar
        </button>
      </header>
    </div>
  );
}


export default App;
