import { composeStories } from '@storybook/react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  test('expands and collapses the content when the button is clicked', () => {
    render(<LongContent />);

    // Initially, the button should say "Show More..."
    const button = screen.getByText('Show More...');
    expect(button).toBeInTheDocument();

    // After clicking the button, it should say "Show Less"
    fireEvent.click(button);
    expect(button.textContent).toBe('Show Less');

    // After clicking the button again, it should say "Show More..."
    fireEvent.click(button);
    expect(button.textContent).toBe('Show More...');
  });
});
