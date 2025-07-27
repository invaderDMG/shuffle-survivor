import { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { gameReducer, initialState } from './reducer';
import { GameState, GameAction } from './types';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);


export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

export default function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Global timer tick
  useEffect(() => {
    if (state.status !== 'playing') return;
    
    const intervalId = setInterval(() => {
      dispatch({ type: 'TICK', dtMs: 50 });
    }, 50);

    return () => clearInterval(intervalId);
  }, [state.status]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
