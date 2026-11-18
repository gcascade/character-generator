import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import CharacterProperty from './CharacterProperty';

describe('CharacterProperty', () => {
  const mockOnButtonClick = vi.fn();

  it('renders without crashing', () => {
    render(
      <CharacterProperty
        tooltip="Reroll"
        label="Test Label"
        value="Test Value"
        onButtonClick={mockOnButtonClick}
      />,
    );
  });

  it('displays the correct label and value', () => {
    render(
      <CharacterProperty
        tooltip="Reroll"
        label="Test Label"
        value="Test Value"
        onButtonClick={mockOnButtonClick}
      />,
    );

    expect(screen.getByText('Test Label:')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('calls onButtonClick when reroll button is clicked', () => {
    render(
      <CharacterProperty
        tooltip="Reroll"
        label="Test Label"
        value="Test Value"
        onButtonClick={mockOnButtonClick}
      />,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnButtonClick).toHaveBeenCalled();
  });
});
