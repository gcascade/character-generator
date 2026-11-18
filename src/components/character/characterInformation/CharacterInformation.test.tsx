import { composeStories } from '@storybook/react-vite';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import * as CharacterInformationStories from './CharacterInformation.stories';

const { Default } = composeStories(CharacterInformationStories);

describe('CharacterInformation', () => {
  test('renders CharacterInformation component without crashing', () => {
    render(<Default />);
  });

  test('displays the character information correctly', () => {
    render(<Default />);

    expect(screen.getByText(/Korvus/i)).toBeInTheDocument();
    expect(screen.getByText(/Blackiron/i)).toBeInTheDocument();
    expect(screen.getByText(/The Unyielding/i)).toBeInTheDocument();
    expect(screen.getByText(/Orc/i)).toBeInTheDocument();
    expect(screen.getByText(/Warrior/i)).toBeInTheDocument();
    expect(screen.getByText(/Male/i)).toBeInTheDocument();
    expect(screen.getByText(/48/i)).toBeInTheDocument();
    expect(screen.getByText(/Lawful Good/i)).toBeInTheDocument();
  });

  test('locks a property and unlocks everything', async () => {
    render(<Default />);
    expect(screen.queryByRole('button', { name: 'Unlock all' })).toBeNull();

    await userEvent.click(
      screen.getByRole('button', { name: 'Lock the race' }),
    );
    expect(
      screen.getByRole('button', { name: 'Unlock the race' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Unlock all' }));
    expect(
      screen.getByRole('button', { name: 'Lock the race' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
