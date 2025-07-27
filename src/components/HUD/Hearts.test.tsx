import { render, screen } from '@testing-library/react';
import Hearts from './Hearts';

describe('Hearts Component', () => {
  it('should render 5 hearts', () => {
    render(<Hearts lives={3} />);
    
    expect(screen.getAllByRole('img')).toHaveLength(5);
  });

  it('should show correct number of full hearts', () => {
    render(<Hearts lives={3} />);
    
    // Check first 3 hearts are full
    expect(screen.getByTestId('heart-0')).not.toHaveClass('lost');
    expect(screen.getByTestId('heart-1')).not.toHaveClass('lost');
    expect(screen.getByTestId('heart-2')).not.toHaveClass('lost');
    
    // Check last 2 hearts are empty
    expect(screen.getByTestId('heart-3')).toHaveClass('lost');
    expect(screen.getByTestId('heart-4')).toHaveClass('lost');
  });

  it('should handle zero lives', () => {
    render(<Hearts lives={0} />);
    
    // All hearts should be lost
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`heart-${i}`)).toHaveClass('lost');
    }
  });

  it('should have proper accessibility labels', () => {
    render(<Hearts lives={2} />);
    
    expect(screen.getAllByLabelText('Full heart')).toHaveLength(2);
    expect(screen.getAllByLabelText('Empty heart')).toHaveLength(3);
  });
});
