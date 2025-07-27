export interface GameState {
  lives: 0 | 1 | 2 | 3 | 4 | 5;
  streak: 0 | 1 | 2 | 3;
  elapsedMs: number;
  playlistUri: string | null;
  status: 'idle' | 'playing' | 'game-over';
  lastTrackId: string | null;
}

export type GameAction = 
  | { type: 'INIT'; playlistUri: string }
  | { type: 'TRACK_END'; skipped: boolean; trackId: string }
  | { type: 'TICK'; dtMs: number }
  | { type: 'RESET' };
