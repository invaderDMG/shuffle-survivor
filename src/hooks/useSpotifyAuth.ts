import { useEffect, useRef } from 'react';
import { generateCodeVerifier, sha256 } from '../auth/pkce';
import { dbg } from '../utils/debug';

const scope =
  'streaming user-read-email user-read-private user-modify-playback-state playlist-read-private';

export function useSpotifyAuth() {
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedVerifier = sessionStorage.getItem('verifier');
    const authCode = params.get('code');
    
    // Global flag to prevent processing the same auth code twice across component instances
    const isProcessingKey = `spotify_processing_${authCode}`;
    const isAlreadyProcessing = sessionStorage.getItem(isProcessingKey);

    if (authCode && storedVerifier && !hasProcessedRef.current && !isAlreadyProcessing) {
      hasProcessedRef.current = true;
      sessionStorage.setItem(isProcessingKey, 'true'); // Global lock
      
      dbg('🔑 Auth code received', authCode);

      // Exchange code for tokens
      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
          code_verifier: storedVerifier,
        }),
      })
        .then(async (r) => {
          dbg('📡 Token POST status', r.status);
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Token exchange failed: ${txt}`);
          }
          return r.json();
        })
        .then(({ access_token, expires_in, refresh_token }) => {
          dbg('✅ Tokens acquired', { 
            access_token: access_token.substring(0, 20) + '...', 
            expires_in 
          });
          
          // Clean up auth artifacts
          sessionStorage.removeItem('verifier');
          sessionStorage.removeItem(isProcessingKey);
          
          // Store tokens
          sessionStorage.setItem('access_token', access_token);
          sessionStorage.setItem('expires_at', (Date.now() + expires_in * 1000).toString());
          sessionStorage.setItem('refresh_token', refresh_token ?? '');
          
          // Clean URL and reload
          window.history.replaceState({}, '', '/');
          window.location.reload();
        })
        .catch((err) => {
          dbg('❌ Token exchange error', err);
          sessionStorage.removeItem(isProcessingKey); // Release lock on error
          hasProcessedRef.current = false;
        });
    }

    // Cleanup function
    return () => {
      if (authCode && !sessionStorage.getItem('access_token')) {
        // If we haven't successfully completed auth, release the lock
        sessionStorage.removeItem(`spotify_processing_${authCode}`);
      }
    };
  }, []);

  const login = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await sha256(verifier);
    sessionStorage.setItem('verifier', verifier);

    const qs = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge: challenge,
      scope,
    });

    dbg('🚀 Redirecting to Spotify /authorize');
    window.location.href = `https://accounts.spotify.com/authorize?${qs.toString()}`;
  };

  return { login };
}
