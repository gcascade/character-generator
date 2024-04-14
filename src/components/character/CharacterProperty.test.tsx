import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import CharacterProperty from './CharacterProperty';

describe('CharacterProperty', () => {
  const mockOnButtonClick = jest.fn();

  it('renders without crashing', () => {
    render(
      <CharacterProperty
        label="Test Label"
        value="Test Value"
        onButtonClick={mockOnButtonClick}
      />,
    );
  });

  it('displays the correct label and value', () => {
    const { getByText } = render(
      <CharacterProperty
        label="Test Label"
        value="Test Value"
        onButtonClick={mockOnButtonClick}
      />,
    );

    expect(getByText('Test Label:')).toBeInTheDocument();
    expect(getByText('Test Value')).toBeInTheDocument();
  });

  it('calls onButtonClick when reroll button is clicked', () => {
    const { getByRole } = render(
      <CharacterProperty
        label="Test Label"
        value="Test Value"
        onButtonClick={mockOnButtonClick}
      />,
    );

    fireEvent.click(getByRole('button'));
    expect(mockOnButtonClick).toHaveBeenCalled();
  });
});
