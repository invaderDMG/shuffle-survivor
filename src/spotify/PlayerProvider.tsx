import { createContext, useEffect, useState, ReactNode } from 'react';

export const PlayerCtx = createContext<Spotify.Player | null>(null);

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const p = new window.Spotify.Player({
        name: 'Shuffle Survivor',
        getOAuthToken: (cb: (t: string) => void) => cb(token),
        volume: 0.8,
      });
      
      p.addListener('ready', ({ device_id }) => {
        console.log('Web Playback SDK ready, device ID:', device_id);
        sessionStorage.setItem('device_id', device_id);
      });
      
      p.connect().then(success => success && setPlayer(p));
    };
  }, []);

  return <PlayerCtx.Provider value={player}>{children}</PlayerCtx.Provider>;
}
