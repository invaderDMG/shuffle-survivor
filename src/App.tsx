import { useState, useEffect } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useStartGame } from './hooks/useStartGame';
import { useGame } from './game/GameProvider';
import PlayerProvider from './spotify/PlayerProvider';
import GameProvider from './game/GameProvider';
import HUD from './components/HUD/HUD';
import SkipControls from './components/HUD/SkipControls';
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
  const { state, dispatch } = useGame();
  const { gameReady, playlistReady, startPlayback, canStartGame } = useStartGame();

  // Function to start a completely new game
  const startNewGame = () => {
    dbg('🔄 Starting completely new game');
    
    // Reset all game state
    dispatch({ type: 'RESET' });
    
    // Clear session storage game data
    sessionStorage.removeItem('game_playlist_uri');
    sessionStorage.removeItem('playlist_name');
    
    // Reload the page to restart everything fresh
    window.location.reload();
  };

  // Show "Start Game" button to get user interaction
  if (playlistReady && !gameReady) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎵 Shuffle Survivor</h1>
          <button onClick={startPlayback} className="start-game-button">
            🎵 Try to survive your playlist
          </button>
          <img
            src={sessionStorage.getItem('playlist_image') || 'placeholder.png'}
            alt="Playlist cover"
            className="playlist-cover"
            width={300}
            height={300}
          />
          <p>
            Playlist: {sessionStorage.getItem('playlist_name') || 'Loading...'}
          </p>
          <div className="game-rules">
            <h3>Rules:</h3>
            <p>• You start with 5 lives ❤️</p>
            <p>• Skip a song = lose a life 💔</p>
            <p>• Listen to 3 full songs = gain a life ✨</p>
            <p>• Game over when you reach 0 lives ☠️</p>
          </div>
        </header>
      </div>
    );
  }

  if (state.status === 'idle' || !gameReady) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎵 Shuffle Survivor</h1>
          <p>Initializing game...</p>
        </header>
      </div>
    );
  }

  if (state.status === 'game-over') {
    return (
      <div className="app">
        <header className="app-header">
          <h1>💀 Game Over!</h1>
          <p>You survived for {Math.floor(state.elapsedMs / 1000)} seconds</p>
          <button onClick={startNewGame}>
            🔄 Play Again
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Shuffle Survivor</h1>
        <HUD />
        <SkipControls />
        <div className="game-controls">
          <p>🎯 Use the skip button to lose lives • Listen to 3 full songs to gain a life</p>
          <button onClick={startNewGame}>
            🔄 New Game
          </button>
        </div>
      </header>
    </div>
  );
}


export default App;
