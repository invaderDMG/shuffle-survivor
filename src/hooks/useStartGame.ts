import { useEffect, useContext } from 'react';
import { PlayerCtx } from '../spotify/PlayerProvider';
import { dbg } from '../utils/debug';

export function useStartGame() {
  const player = useContext(PlayerCtx);
  const token = sessionStorage.getItem('access_token')!;
  const deviceId = sessionStorage.getItem('device_id');

  useEffect(() => {
    if (!player || !token || !deviceId) return;

    (async () => {
      try {
        dbg('🎮 Beginning game bootstrap');

        // 0. Transfer playback
        const xfer = await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_ids: [deviceId], play: false }),
        });
        dbg('🔀 Transfer response', xfer.status);

        // 1. Fetch playlists
        const pls = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });
        dbg('📄 Playlists response', pls.status);
        const { items } = await pls.json();
        if (!items.length) throw new Error('No playlists');

        const { uri } = items[Math.floor(Math.random() * items.length)];
        dbg('🎲 Chosen playlist', uri);

        // 2. Enable shuffle
        const shf = await fetch('https://api.spotify.com/v1/me/player/shuffle?state=true', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });
        dbg('🔀 Shuffle response', shf.status);

        // 3. Start playback
        const play = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ context_uri: uri }),
          },
        );
        dbg('▶️  Play response', play.status);

        // 4. Track events
        player.addListener('player_state_changed', (s) => dbg('🎼 State change', s));
        dbg('🏁 Game start complete');
      } catch (err) {
        dbg('❌ useStartGame error', err);
      }
    })();
  }, [player, token, deviceId]);
}
