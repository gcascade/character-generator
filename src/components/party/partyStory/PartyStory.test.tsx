import { render, screen } from '@testing-library/react';
import React from 'react';
import { generateParty, renderParty } from '../../../content/party';
import { LocaleProvider } from '../../../i18n';
import PartyStory from './PartyStory';

describe('PartyStory', () => {
  const party = generateParty({ size: 3 });

  it('shows the party name as a heading and its story', () => {
    render(<PartyStory party={party} />);
    const { name, story } = renderParty(party, 'en');
    expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    for (const paragraph of story) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it('follows the interface language', () => {
    render(
      <LocaleProvider initial="fr">
        <PartyStory party={party} />
      </LocaleProvider>,
    );
    expect(
      screen.getByRole('heading', { name: renderParty(party, 'fr').name }),
    ).toBeInTheDocument();
  });

  it('labels an AI story written in another language', () => {
    render(
      <PartyStory
        party={{
          ...party,
          text: {
            name: 'La Rose',
            story: ['Un.'],
            language: 'fr',
            source: 'ai',
          },
        }}
      />,
    );
    expect(screen.getByText('Written by AI in French')).toBeInTheDocument();
  });
});
