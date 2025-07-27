import { render, screen } from '@testing-library/react';
import HUD from './HUD';
// ✅ Use absolute import instead of relative
import { useGame } from '@game/GameProvider';

// Mock the useGame hook for controlled testing
jest.mock('@game/GameProvider', () => ({
  ...jest.requireActual('@game/GameProvider'),
  useGame: jest.fn(),
}));

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;

describe('HUD Component', () => {
  const mockGameState = {
    lives: 3,
    streak: 1,
    elapsedMs: 65000, // 1 minute 5 seconds
    status: 'playing' as const,
    playlistUri: 'test:playlist',
    lastTrackId: null,
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    mockUseGame.mockReturnValue({
      state: mockGameState,
      dispatch: mockDispatch,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render game timer correctly', () => {
    render(<HUD />);
    
    const timer = screen.getByTestId('game-timer');
    expect(timer).toHaveTextContent('01:05');
  });

  // ... rest of your tests
});
