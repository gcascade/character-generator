import { composeStories } from '@storybook/react-vite';
import { fireEvent, render } from '@testing-library/react';
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
    const { getByRole } = render(<Enabled />);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct tooltip', async () => {
    const baseDom = render(<Enabled />);

    fireEvent.mouseOver(baseDom.getByTestId('reroll-button'));

    expect(await baseDom.findByText('Reroll')).toBeInTheDocument();
  });

  it('calls onButtonClick when enabled button is clicked', () => {
    const { getByRole } = render(<Enabled onButtonClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('does not call onButtonClick when disabled button is clicked', () => {
    const { getByRole } = render(<Disabled onButtonClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
