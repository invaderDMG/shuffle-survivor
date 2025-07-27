import { useEffect } from 'react';
import { generateCodeVerifier, sha256 } from '../auth/pkce';

const scope =
  'streaming user-read-email user-read-private user-modify-playback-state playlist-read-private';

export function useSpotifyAuth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storedVerifier = sessionStorage.getItem('verifier');

    if (params.get('code') && storedVerifier) {
      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code: params.get('code')!,
          redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
          code_verifier: storedVerifier,
        }),
      })
        .then(r => r.json())
        .then(({ access_token, expires_in, refresh_token }) => {
            sessionStorage.setItem('access_token', access_token);
            sessionStorage.setItem('expires_at', (Date.now() + expires_in * 1000).toString());
            sessionStorage.setItem('refresh_token', refresh_token ?? '');
            window.history.replaceState({}, '', '/');
            window.location.reload();
        });
    }
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

    window.location.href = `https://accounts.spotify.com/authorize?${qs.toString()}`;
  };

  return { login };
}
