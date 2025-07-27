import { useEffect, useContext } from 'react';
import { PlayerCtx } from '../spotify/PlayerProvider';

export function useStartGame() {
  const player = useContext(PlayerCtx);
  const token = sessionStorage.getItem('access_token')!;

  useEffect(() => {
    const deviceId = sessionStorage.getItem('device_id');
    if (!player || !token || !deviceId) return;

    (async () => {
      try {
        // 0. Transfer playback to this browser device
        const transferRes = await fetch(
          `https://api.spotify.com/v1/me/player`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              device_ids: [deviceId],
              play: false
            })
          }
        );
        if (!transferRes.ok) throw new Error(`Transfer error: ${transferRes.status}`);

        // 1. Fetch user playlists
        const plRes = await fetch(
          'https://api.spotify.com/v1/me/playlists?limit=50',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!plRes.ok) throw new Error(`Playlists error: ${plRes.status}`);
        const { items: playlists } = await plRes.json() as { items: Array<{ id: string; uri: string }> };

        if (!playlists.length) throw new Error('No playlists available');

        // 2. Pick one at random
        const { uri } = playlists[Math.floor(Math.random() * playlists.length)];

        // 3. Enable shuffle
        const shuffleRes = await fetch(
          'https://api.spotify.com/v1/me/player/shuffle?state=true',
          { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
        );
        if (!shuffleRes.ok) throw new Error(`Shuffle error: ${shuffleRes.status}`);

        // 4. Start playbook
        const playRes = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context_uri: uri })
          }
        );
        if (!playRes.ok) throw new Error(`Play error: ${playRes.status}`);

        // 5. Subscribe to state changes for game logic
        player.addListener('player_state_changed', (state) => {
          console.log('Track state:', state);
          // TODO: Implement life-tracking logic here
        });

        console.log('Game started successfully! 🎵');
      } catch (err) {
        console.error('useStartGame error', err);
      }
    })();
  }, [player, token]);
}
