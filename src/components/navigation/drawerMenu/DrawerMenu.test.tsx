import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { LocaleProvider } from '../../../i18n';
import DrawerMenu from './DrawerMenu';

const renderMenu = (props: Partial<React.ComponentProps<typeof DrawerMenu>>) =>
  render(
    <MemoryRouter>
      <DrawerMenu width={240} {...props} />
    </MemoryRouter>,
  );

describe('DrawerMenu', () => {
  it('shows the navigation links when permanent', () => {
    renderMenu({});
    expect(
      screen.getByRole('link', { name: 'Character Generator' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'My Characters' })).toHaveAttribute(
      'href',
      '/characters',
    );
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('hides the links when temporary and closed', () => {
    renderMenu({ variant: 'temporary', open: false });
    expect(
      screen.queryByRole('link', { name: 'Settings' }),
    ).not.toBeInTheDocument();
  });

  it('closes after a link is chosen when temporary', () => {
    const onClose = vi.fn();
    renderMenu({ variant: 'temporary', open: true, onClose });

    fireEvent.click(screen.getByRole('link', { name: 'Settings' }));

    expect(onClose).toHaveBeenCalled();
  });
});

describe('DrawerMenu language selector', () => {
  beforeEach(() => localStorage.clear());

  it('switches the whole menu to French and remembers it', () => {
    render(
      <LocaleProvider initial="en">
        <MemoryRouter>
          <DrawerMenu width={240} />
        </MemoryRouter>
      </LocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'French' }));

    expect(
      screen.getByRole('link', { name: 'Mes personnages' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Français' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(localStorage.getItem('locale')).toBe('fr');
  });
});

describe('DrawerMenu colour mode', () => {
  it('offers light, system and dark next to the language', () => {
    render(
      <MemoryRouter>
        <DrawerMenu width={240} />
      </MemoryRouter>,
    );
    const group = screen.getByRole('group', { name: 'Theme' });
    for (const name of ['Light', 'System', 'Dark']) {
      expect(within(group).getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
