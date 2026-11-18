import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows no padlock unless asked', () => {
    render(
      <CharacterProperty
        tooltip="Reroll"
        label="Race"
        value="Elf"
        onButtonClick={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Lock the race' })).toBeNull();
  });

  it('toggles its padlock with the mouse or the keyboard', async () => {
    const onToggleLock = vi.fn();
    const { rerender } = render(
      <CharacterProperty
        tooltip="Reroll"
        label="Race"
        value="Elf"
        onButtonClick={vi.fn()}
        onToggleLock={onToggleLock}
        lockLabel="Lock the race"
      />,
    );
    const padlock = screen.getByRole('button', { name: 'Lock the race' });
    expect(padlock).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(padlock);
    expect(onToggleLock).toHaveBeenCalledTimes(1);
    padlock.focus();
    await userEvent.keyboard(' ');
    expect(onToggleLock).toHaveBeenCalledTimes(2);

    rerender(
      <CharacterProperty
        tooltip="Reroll"
        label="Race"
        value="Elf"
        onButtonClick={vi.fn()}
        onToggleLock={onToggleLock}
        lockLabel="Unlock the race"
        locked
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Unlock the race' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
