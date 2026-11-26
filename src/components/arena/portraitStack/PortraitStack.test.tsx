import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import PortraitStack from './PortraitStack';

const [aela, brom, korvus] = arenaSetup.contestants.map((c) => c.character);

describe('PortraitStack', () => {
  it('names everyone in the stack', () => {
    render(<PortraitStack characters={[aela, brom]} />);
    expect(
      screen.getByRole('img', { name: 'Portraits of Aela, Brom' }),
    ).toBeInTheDocument();
  });

  it('brings each portrait to the front in turn while hovered', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<PortraitStack characters={[aela, brom, korvus]} />);
    const stack = screen.getByRole('img', { name: /Portraits/ });
    expect(stack).toHaveAttribute('tabindex', '0');
    fireEvent.mouseOver(stack);
    fireEvent.mouseEnter(stack);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Aela');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Brom');
    fireEvent.mouseLeave(stack);
    vi.useRealTimers();
  });

  it('shows nothing when nobody is there', () => {
    render(<PortraitStack characters={[]} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
