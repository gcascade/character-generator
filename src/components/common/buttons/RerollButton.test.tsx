import { composeStories } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { fn } from 'storybook/test';
import * as RerollButtonStories from './RerollButton.stories';

const { Enabled, Disabled } = composeStories(RerollButtonStories);

describe('RerollButton', () => {
  const handleClick = fn();

  beforeEach(() => {
    handleClick.mockClear();
  });

  it('renders without crashing', () => {
    render(<Enabled />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct tooltip', async () => {
    render(<Enabled />);

    fireEvent.mouseOver(screen.getByTestId('reroll-button'));

    expect(await screen.findByText('Reroll')).toBeInTheDocument();
  });

  it('calls onButtonClick when enabled button is clicked', () => {
    render(<Enabled onButtonClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('does not call onButtonClick when disabled button is clicked', () => {
    render(<Disabled onButtonClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
