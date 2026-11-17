import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
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
