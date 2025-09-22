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
    const existingFlag = sessionStorage.getItem(sdkInitFlag);
    
    // If flag exists but is old (more than 30 seconds), clear it
    if (existingFlag) {
      const flagTime = parseInt(existingFlag);
      if (Date.now() - flagTime > 30000) {
        dbg('🎧 Clearing old SDK init flag');
        sessionStorage.removeItem(sdkInitFlag);
      } else {
        dbg('🎧 SDK already initializing, skipping...');
        return;
      }
    }

    isInitializingRef.current = true;
    sessionStorage.setItem(sdkInitFlag, Date.now().toString());
    
    dbg('🎧 Injecting Web Playback SDK');

    // Check if SDK is already loaded
    if ((window as any).Spotify?.Player) {
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
      const p = new (window as any).Spotify.Player({
        name: 'Shuffle Survivor',
        getOAuthToken: (cb: (token: string) => void) => {
          const t = sessionStorage.getItem('access_token')!;
          dbg('🔄 SDK requested fresh token');
          cb(t);
        },
        volume: 0.8,
      });

      p.addListener('ready', ({ device_id }: { device_id: string }) => {
        dbg('✅ Player ready – device_id', device_id);
        sessionStorage.setItem('device_id', device_id);
        sessionStorage.removeItem(sdkInitFlag); // Success - remove flag
        isInitializingRef.current = false; // Reset ref
      });

      p.addListener('not_ready', () => {
        dbg('⚠️ Player went off-line');
        sessionStorage.removeItem(sdkInitFlag); // Reset flag on disconnect
        isInitializingRef.current = false; // Reset ref
      });

      p.addListener('initialization_error', (error: any) => {
        dbg('❌ Player initialization error', error);
        sessionStorage.removeItem(sdkInitFlag); // Reset flag on error
        isInitializingRef.current = false; // Reset ref
      });

      p.connect()
        .then((ok: boolean) => {
          dbg('🔌 p.connect() resolved', ok);
          if (ok) {
            setPlayer(p);
          } else {
            dbg('❌ Player connection failed');
            sessionStorage.removeItem(sdkInitFlag);
            isInitializingRef.current = false;
          }
        })
        .catch((err: unknown) => {
          dbg('❌ p.connect() error', err);
          sessionStorage.removeItem(sdkInitFlag); // Reset flag on error
          isInitializingRef.current = false; // Reset ref
        });
    }

    // Cleanup function
    return () => {
      isInitializingRef.current = false;
    };
  }, []);

  return <PlayerCtx.Provider value={player}>{children}</PlayerCtx.Provider>;
}
