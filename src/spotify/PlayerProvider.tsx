import { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { dbg } from '../utils/debug';

export const PlayerCtx = createContext<Spotify.Player | null>(null);

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token || isInitializingRef.current) return;

    // Global flag to prevent duplicate SDK initialization
    const sdkInitFlag = 'spotify_sdk_initializing';
    if (sessionStorage.getItem(sdkInitFlag)) {
      dbg('🎧 SDK already initializing, skipping...');
      return;
    }

    isInitializingRef.current = true;
    sessionStorage.setItem(sdkInitFlag, 'true');
    
    dbg('🎧 Injecting Web Playback SDK');

    // Check if SDK is already loaded
    if (window.Spotify?.Player) {
      dbg('🎼 SDK already loaded – constructing player');
      createPlayer(token);
      return;
    }

    // Load SDK script only if not already present
    if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      dbg('🎼 SDK ready – constructing player');
      createPlayer(token);
    };

    function createPlayer(token: string) {
      const p = new window.Spotify.Player({
        name: 'Shuffle Survivor',
        getOAuthToken: (cb) => {
          const t = sessionStorage.getItem('access_token')!;
          dbg('🔄 SDK requested fresh token');
          cb(t);
        },
        volume: 0.8,
      });

      p.addListener('ready', ({ device_id }) => {
        dbg('✅ Player ready – device_id', device_id);
        sessionStorage.setItem('device_id', device_id);
        sessionStorage.removeItem(sdkInitFlag); // Success - remove flag
      });

      p.addListener('not_ready', () => {
        dbg('⚠️ Player went off-line');
        sessionStorage.removeItem(sdkInitFlag); // Reset flag on disconnect
      });

      p.connect()
        .then((ok: boolean) => {
          dbg('🔌 p.connect() resolved', ok);
          if (ok) setPlayer(p);
        })
        .catch((err: unknown) => {
          dbg('❌ p.connect() error', err);
          sessionStorage.removeItem(sdkInitFlag); // Reset flag on error
        });
    }

    // Cleanup function
    return () => {
      isInitializingRef.current = false;
    };
  }, []);

  return <PlayerCtx.Provider value={player}>{children}</PlayerCtx.Provider>;
}
