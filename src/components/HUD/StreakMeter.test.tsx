import { render, screen } from '@testing-library/react';
import StreakMeter from './StreakMeter';

describe('StreakMeter Component', () => {
  it('should render with zero streak', () => {
    render(<StreakMeter streak={0} />);
    
    expect(screen.getByTestId('streak-meter')).toBeInTheDocument();
    expect(screen.getByTestId('streak-text')).toHaveTextContent('0/3 songs to gain life');
    
    // All dots should be empty
    for (let i = 0; i < 3; i++) {
      const dot = screen.getByTestId(`streak-dot-${i}`);
      expect(dot).not.toHaveClass('filled');
      expect(dot).not.toHaveClass('active');
    }
  });

  it('should show correct progress for streak of 1', () => {
    render(<StreakMeter streak={1} />);
    
    expect(screen.getByTestId('streak-text')).toHaveTextContent('1/3 songs to gain life');
    
    // First dot should be filled and active
    expect(screen.getByTestId('streak-dot-0')).toHaveClass('filled');
    expect(screen.getByTestId('streak-dot-0')).toHaveClass('active');
    
    // Other dots should be empty
    expect(screen.getByTestId('streak-dot-1')).not.toHaveClass('filled');
    expect(screen.getByTestId('streak-dot-2')).not.toHaveClass('filled');
  });

  it('should show correct progress for streak of 2', () => {
    render(<StreakMeter streak={2} />);
    
    expect(screen.getByTestId('streak-text')).toHaveTextContent('2/3 songs to gain life');
    
    // First two dots should be filled
    expect(screen.getByTestId('streak-dot-0')).toHaveClass('filled');
    expect(screen.getByTestId('streak-dot-1')).toHaveClass('filled');
    expect(screen.getByTestId('streak-dot-1')).toHaveClass('active');
    
    // Last dot should be empty
    expect(screen.getByTestId('streak-dot-2')).not.toHaveClass('filled');
  });

  it('should show life gained message for streak of 3', () => {
    render(<StreakMeter streak={3} />);
    
    expect(screen.getByTestId('streak-text')).toHaveTextContent('3/3 🎉 Life Gained!');
    
    // All dots should be filled
    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`streak-dot-${i}`)).toHaveClass('filled');
    }
    
    // Last dot should be active
    expect(screen.getByTestId('streak-dot-2')).toHaveClass('active');
  });

  it('should have proper accessibility attributes', () => {
    render(<StreakMeter streak={1} />);
    
    expect(screen.getByLabelText('Completed song')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Remaining song')).toHaveLength(2);
  });

  it('should handle edge case of invalid streak values gracefully', () => {
    // TypeScript should prevent this, but test runtime behavior
    render(<StreakMeter streak={5 as any} />);
    
    // Should still render without crashing
    expect(screen.getByTestId('streak-meter')).toBeInTheDocument();
    
    // All dots should appear filled (since 5 > 3)
    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`streak-dot-${i}`)).toHaveClass('filled');
    }
  });
});
