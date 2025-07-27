import { GameState, GameAction } from './types';

export const MAX_LIVES = 5 as const;

export const initialState: GameState = {
  lives: MAX_LIVES,
  streak: 0,
  elapsedMs: 0,
  playlistUri: null,
  status: 'idle',
  lastTrackId: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT':
      return {
        ...initialState,
        playlistUri: action.playlistUri,
        status: 'playing',
      };
    case 'TRACK_END': {
      if (state.status !== 'playing') return state;
      let { lives, streak } = state;

      if (action.skipped) {
        lives = Math.max(0, lives - 1) as GameState['lives'];
        streak = 0;
      } else {
        streak = (streak + 1) as GameState['streak'];
        if (streak === 3 && lives < MAX_LIVES) {
          lives = (lives + 1) as GameState['lives'];
          streak = 0;
        }
      }

      const newStatus = lives === 0 ? 'game-over' : 'playing';
      return { 
        ...state, 
        lives, 
        streak, 
        status: newStatus, 
        lastTrackId: action.trackId 
      };
    }
    case 'TICK':
      if (state.status !== 'playing') return state;
      return { ...state, elapsedMs: state.elapsedMs + action.dtMs };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}
