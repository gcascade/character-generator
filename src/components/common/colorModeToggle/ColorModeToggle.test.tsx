import { ThemeProvider } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import theme from '../../../themes/themes';
import ColorModeToggle from './ColorModeToggle';

const renderToggle = (variant: 'compact' | 'select') =>
  render(
    <ThemeProvider theme={theme} defaultMode="system">
      <ColorModeToggle variant={variant} />
    </ThemeProvider>,
  );

describe('ColorModeToggle', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('switches to dark and remembers it', async () => {
    renderToggle('compact');
    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('mui-mode')).toBe('dark');
  });

  it('offers the same choice as a select', async () => {
    renderToggle('select');
    await userEvent.click(screen.getByRole('combobox', { name: 'Theme' }));
    await userEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: 'Light',
      }),
    );
    expect(localStorage.getItem('mui-mode')).toBe('light');
  });
});
