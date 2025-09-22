import { useState, useEffect } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useGame } from './game/GameProvider';
import PlayerProvider from './spotify/PlayerProvider';
import GameProvider from './game/GameProvider';
import HUD from './components/HUD/HUD';
import SkipControls from './components/HUD/SkipControls';
import LoadingScreen from './components/LoadingScreen';
import AppScreen from './components/AppScreen';
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
      <AppScreen>
        <h1>🎵 Shuffle Survivor</h1>
        <p>¡Gamifica tu experiencia de Spotify con un sistema de vidas!</p>
        <p>Conecta tu cuenta de Spotify y desafía a tu playlist favorita.</p>
        <button onClick={login} className="primary-button">
          🎵 Conectar con Spotify
        </button>
      </AppScreen>
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
      <AppScreen>
        <h1>🎵 Shuffle Survivor</h1>
        <div className="content-section">
          <h2>❌ Error</h2>
          <p>{appState.status === 'error' ? appState.message : 'Algo salió mal'}</p>
        </div>
        <button onClick={resetApp} className="action-button">
          🔄 Intentar de nuevo
        </button>
      </AppScreen>
    );
  }

  // Estado listo para empezar
  if (isReady) {
    return (
      <AppScreen>
        <h1>🎵 Shuffle Survivor</h1>
        <button onClick={startGame} className="primary-button">
          🎵 Intenta sobrevivir a tu playlist
        </button>
        <img
          src={appState.status === 'ready' ? appState.playlistImage : 'placeholder.png'}
          alt="Portada de playlist"
          width={300}
          height={300}
        />
        <div className="content-section">
          <h2>🎵 {appState.status === 'ready' ? appState.playlistName : 'Cargando...'}</h2>
        </div>
        <div className="rules-list">
          <h3>Reglas del Juego</h3>
          <p>• Empiezas con 5 vidas ❤️</p>
          <p>• Saltar una canción = perder una vida 💔</p>
          <p>• Escuchar 3 canciones completas = ganar una vida ✨</p>
          <p>• Game over cuando llegues a 0 vidas ☠️</p>
        </div>
      </AppScreen>
    );
  }

  // Estado de game over
  if (state.status === 'game-over') {
    return (
      <AppScreen>
        <h1>💀 ¡Game Over!</h1>
        <div className="content-section">
          <h2>🏆 Estadísticas</h2>
          <p>Sobreviviste por <strong>{Math.floor(state.elapsedTime / 1000)} segundos</strong></p>
          <p>¡Buen intento! ¿Quieres probar de nuevo?</p>
        </div>
        <button onClick={resetApp} className="primary-button">
          🔄 Jugar de nuevo
        </button>
      </AppScreen>
    );
  }

  // Estado de juego activo
  if (isPlaying && state.status === 'playing') {
    return (
      <AppScreen>
        <h1>🎵 Shuffle Survivor</h1>
        <div className="content-section">
          <HUD />
          <SkipControls />
        </div>
        <div className="game-controls">
          <p>🎯 Usa el botón de saltar para perder vidas • Escucha 3 canciones completas para ganar una vida</p>
          <button onClick={resetApp} className="secondary-button">
            🔄 Nuevo Juego
          </button>
        </div>
      </AppScreen>
    );
  }

  // Fallback - no debería llegar aquí
  return (
    <AppScreen>
      <h1>🎵 Shuffle Survivor</h1>
      <div className="content-section">
        <h2>⚠️ Estado Inesperado</h2>
        <p>Algo inesperado pasó. Por favor recarga la página.</p>
      </div>
      <button onClick={() => window.location.reload()} className="action-button">
        🔄 Recargar
      </button>
    </AppScreen>
  );
}


export default App;
