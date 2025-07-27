import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import GameProvider, { useGame } from './GameProvider';

describe('GameProvider', () => {
  it('should provide initial game state', () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: GameProvider
    });

    expect(result.current.state.lives).toBe(5);
    expect(result.current.state.status).toBe('idle');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
        renderHook(() => useGame());
    }).toThrow('useGame must be used within GameProvider');
  });

  it('should start timer when game status is playing', async () => {
    const { result } = renderHook(() => useGame(), {
      wrapper: GameProvider
    });

    act(() => {
      result.current.dispatch({
        type: 'INIT',
        playlistUri: 'spotify:playlist:123'
      });
    });

    const initialTime = result.current.state.elapsedMs;

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.state.elapsedMs).toBeGreaterThan(initialTime);
  });
});
