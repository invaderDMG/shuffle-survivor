import { useState, useEffect } from 'react';
import { useSpotifyAuth } from './hooks/useSpotifyAuth';
import { useStartGame } from './hooks/useStartGame';
import PlayerProvider from './spotify/PlayerProvider';
import './App.css';

function App() {
  const { login } = useSpotifyAuth();
  const [token, setToken] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    const expiresAt = sessionStorage.getItem('expires_at');
    
    if (storedToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      setToken(storedToken);
    }
  }, []);

  // If not logged in, show login button
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

  // If logged in, show the player interface
  return (
    <PlayerProvider>
      <GameStartWrapper />
    </PlayerProvider>
  );
}

function GameStartWrapper() {
  useStartGame(); // Invoke the game-start hook
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 Shuffle Survivor</h1>
        <p>Connected to Spotify! Game starting…</p>
        <button onClick={() => {
          sessionStorage.clear();
          window.location.reload();
        }}>
          Logout
        </button>
      </header>
    </div>
  );
}

export default App;
