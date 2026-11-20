import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { LocaleProvider } from '../../../i18n';
import NpcSheet from './NpcSheet';

describe('NpcSheet', () => {
  it('shows who the NPC is and the six sections', () => {
    render(<NpcSheet npc={brennaThistledown} />);
    expect(
      screen.getByRole('heading', { name: 'Brenna Thistledown' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Innkeeper')).toBeInTheDocument();
    expect(screen.getByText('Halfling')).toBeInTheDocument();
    for (const title of [
      'Look',
      'Daily life',
      'Quirk',
      'Rumour',
      'Secret',
      'About adventurers',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    expect(
      screen.getByText(/Spends more time in the kitchen/),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('reroll-button')).not.toBeInTheDocument();
  });

  it('agrees with the gender in French', () => {
    render(
      <LocaleProvider initial="fr">
        <NpcSheet npc={brennaThistledown} />
      </LocaleProvider>,
    );
    expect(screen.getByText('Halfeline')).toBeInTheDocument();
    expect(screen.getByText('Aubergiste')).toBeInTheDocument();
    expect(screen.getByText('Quotidien')).toBeInTheDocument();
  });

  it('offers dice and padlocks when given actions', async () => {
    const onReroll = vi.fn();
    const onToggleLock = vi.fn();
    render(
      <NpcSheet
        npc={brennaThistledown}
        actions={{
          onReroll,
          onToggleLock,
          isLocked: (property) => property === 'race',
        }}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Reroll the rumour' }),
    );
    expect(onReroll).toHaveBeenCalledWith('rumour');
    await userEvent.click(
      screen.getByRole('button', { name: 'Reroll the occupation' }),
    );
    expect(onReroll).toHaveBeenCalledWith('occupation');
    await userEvent.click(
      screen.getByRole('button', { name: 'Unlock the race' }),
    );
    expect(onToggleLock).toHaveBeenCalledWith('race');
    expect(
      screen.getByRole('button', { name: 'Lock the occupation' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows AI text with its notice', () => {
    render(
      <NpcSheet
        npc={{
          ...brennaThistledown,
          text: {
            language: 'en',
            source: 'ai',
            look: 'A red scarf.',
            daily: 'd',
            quirk: 'q',
            rumour: 'r',
            secret: 's',
            opinion: 'o',
          },
        }}
      />,
    );
    const article = screen.getByRole('article');
    expect(within(article).getByText('A red scarf.')).toBeInTheDocument();
    expect(within(article).getByText(/Written by AI/)).toBeInTheDocument();
  });
});
