import { composeStories } from '@storybook/react-vite';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import * as CharacterBackgroundStories from './CharacterBackground.stories';

const { LongContent, ShortContent } = composeStories(
  CharacterBackgroundStories,
);

describe('CharacterBackground', () => {
  test('renders CharacterBackground component without crashing', () => {
    render(<LongContent />);
  });

  test('displays the title correctly', () => {
    render(<LongContent />);
    expect(screen.getByText('Outcast of the Deep Delve')).toBeInTheDocument();
  });

  test('displays the content correctly', () => {
    render(<ShortContent />);
    expect(
      screen.getByText(
        "Eira was born deep within the dwarven stronghold of Kragnir's Spire.",
      ),
    ).toBeInTheDocument();
  });

  test('shows the first paragraph whole and opens the full story', async () => {
    render(<LongContent />);
    const first = screen.getByText(/^Eira was born deep within/);
    expect(first.textContent).toMatch(/hard labor\.$/);
    expect(screen.queryByText(/Starheart crystal/)).toBeNull();

    const read = screen.getByRole('button', { name: 'Read the story' });
    await userEvent.click(read);
    const dialog = screen.getByRole('dialog', {
      name: 'Outcast of the Deep Delve',
    });
    expect(dialog).toHaveTextContent(/Starheart crystal/);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(read).toHaveFocus();
  });

  test('offers no reading view for a one-paragraph story', () => {
    render(<ShortContent />);
    expect(screen.queryByRole('button', { name: 'Read the story' })).toBeNull();
  });
});
