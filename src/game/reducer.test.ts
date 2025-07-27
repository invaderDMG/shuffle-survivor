import { gameReducer, initialState, MAX_LIVES } from './reducer';
import { GameState } from './types';

describe('gameReducer', () => {
  describe('INIT action', () => {
    it('should initialize game with full lives and playing status', () => {
      const result = gameReducer(initialState, {
        type: 'INIT',
        playlistUri: 'spotify:playlist:123'
      });

      expect(result.lives).toBe(MAX_LIVES);
      expect(result.status).toBe('playing');
      expect(result.playlistUri).toBe('spotify:playlist:123');
      expect(result.streak).toBe(0);
    });
  });

  describe('TRACK_END action', () => {
    const playingState: GameState = {
      ...initialState,
      status: 'playing',
      lives: 3,
    };

    it('should lose a life when track is skipped', () => {
      const result = gameReducer(playingState, {
        type: 'TRACK_END',
        skipped: true,
        trackId: 'track123'
      });

      expect(result.lives).toBe(2);
      expect(result.streak).toBe(0);
      expect(result.lastTrackId).toBe('track123');
    });

    it('should increment streak when track ends naturally', () => {
      const result = gameReducer(playingState, {
        type: 'TRACK_END',
        skipped: false,
        trackId: 'track123'
      });

      expect(result.lives).toBe(3);
      expect(result.streak).toBe(1);
    });

    it('should gain life after three full listens', () => {
      let state: GameState = { ...playingState, streak: 2 };
      
      const result = gameReducer(state, {
        type: 'TRACK_END',
        skipped: false,
        trackId: 'track123'
      });

      expect(result.lives).toBe(4);
      expect(result.streak).toBe(0);
    });

    it('should not exceed max lives', () => {
      let state: GameState = { ...playingState, lives: MAX_LIVES, streak: 2 };
      
      const result = gameReducer(state, {
        type: 'TRACK_END',
        skipped: false,
        trackId: 'track123'
      });

      expect(result.lives).toBe(MAX_LIVES);
    });

    it('should trigger game over when lives reach zero', () => {
      let state: GameState = { ...playingState, lives: 1 };
      
      const result = gameReducer(state, {
        type: 'TRACK_END',
        skipped: true,
        trackId: 'track123'
      });

      expect(result.lives).toBe(0);
      expect(result.status).toBe('game-over');
    });
  });

  describe('TICK action', () => {
    it('should add elapsed time', () => {
      const result = gameReducer(initialState, {
        type: 'TICK',
        dtMs: 50
      });

      expect(result.elapsedMs).toBe(50);
    });
  });

  describe('RESET action', () => {
    it('should reset to initial state', () => {
      const modifiedState: GameState = {
        ...initialState,
        lives: 2,
        elapsedMs: 1000,
        status: 'game-over' as const
      };

      const result = gameReducer(modifiedState, { type: 'RESET' });

      expect(result).toEqual(initialState);
    });
  });
});
