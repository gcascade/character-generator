import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { generateParty } from '../../../content/party';
import { renderHook as hookText } from '../../../content/partyDepth';
import { LocaleProvider } from '../../../i18n';
import AdventureHook from './AdventureHook';

const party = generateParty({ size: 3 });

describe('AdventureHook', () => {
  it('shows the starting point in the interface language', () => {
    render(
      <LocaleProvider initial="fr">
        <AdventureHook party={party} />
      </LocaleProvider>,
    );
    expect(screen.getByText(hookText(party, 'fr'))).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('draws another starting point', async () => {
    const onReroll = vi.fn();
    render(<AdventureHook party={party} onReroll={onReroll} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Draw another starting point' }),
    );
    expect(onReroll).toHaveBeenCalled();
  });

  it('labels an AI starting point written in another language', () => {
    render(
      <AdventureHook
        party={{
          ...party,
          text: {
            name: 'N',
            story: ['S'],
            hook: 'Un début.',
            language: 'fr',
            source: 'ai',
          },
        }}
      />,
    );
    expect(screen.getByText('Un début.')).toBeInTheDocument();
    expect(screen.getByText('Written by AI in French')).toBeInTheDocument();
  });
});
