import { createContext, useReducer, useContext, ReactNode, useEffect, useRef } from 'react';
import { gameReducer, initialState } from './reducer';
import { GameState, GameAction } from './types';
import { dbg } from '../utils/debug';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType>({
  state: initialState,
  dispatch: () => {}
});

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

export default function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (state.status === 'playing') {
      dbg('🕐 Timer starting fresh from 0');
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK', dtMs: 50 });
      }, 50);
    } else {
      dbg('🕐 Timer stopped - game not playing');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.status]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
