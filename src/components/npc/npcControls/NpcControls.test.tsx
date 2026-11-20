import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ReactNode } from 'react';
import { NpcProvider } from '../../../contexts/NpcContext';
import { LocaleProvider } from '../../../i18n';
import NpcControls from './NpcControls';

const wrap = (children: ReactNode, locale: 'en' | 'fr' = 'en') => (
  <LocaleProvider initial={locale}>
    <NpcProvider>{children}</NpcProvider>
  </LocaleProvider>
);

describe('NpcControls', () => {
  beforeEach(() => localStorage.clear());

  it('chooses an occupation and keeps it', async () => {
    render(
      wrap(<NpcControls onGenerate={vi.fn()} onGenerateBatch={vi.fn()} />),
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Occupation' }));
    await userEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Gravedigger',
      }),
    );
    expect(
      screen.getByRole('combobox', { name: 'Occupation' }),
    ).toHaveTextContent('Gravedigger');
    expect(
      JSON.parse(localStorage.getItem('npc')!).constraints.occupation,
    ).toBe('Gravedigger');
  });

  it('lists the occupations in alphabetical order of the language', async () => {
    render(
      wrap(
        <NpcControls onGenerate={vi.fn()} onGenerateBatch={vi.fn()} />,
        'fr',
      ),
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Métier' }));
    const options = within(screen.getByRole('listbox'))
      .getAllByRole('option')
      .map((o) => o.textContent);
    expect(options.slice(0, 3)).toEqual([
      'Peu importe',
      'Alchimiste',
      'Aubergiste',
    ]);
  });

  it('generates one or five', async () => {
    const onGenerate = vi.fn();
    const onGenerateBatch = vi.fn();
    render(
      wrap(
        <NpcControls
          onGenerate={onGenerate}
          onGenerateBatch={onGenerateBatch}
        />,
      ),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }));
    await userEvent.click(screen.getByRole('button', { name: 'Generate 5' }));
    expect(onGenerate).toHaveBeenCalledOnce();
    expect(onGenerateBatch).toHaveBeenCalledOnce();
  });

  it('is disabled while generating', () => {
    render(
      wrap(
        <NpcControls
          onGenerate={vi.fn()}
          onGenerateBatch={vi.fn()}
          generating
        />,
      ),
    );
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
  });
});
