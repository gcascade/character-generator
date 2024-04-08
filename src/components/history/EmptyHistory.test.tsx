import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import EmptyHistory from './EmptyHistory';

describe('EmptyHistory', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <EmptyHistory />
      </ThemeProvider>,
    );
  });

  it('displays the correct text', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <EmptyHistory />
      </ThemeProvider>,
    );

    expect(screen.getByText('No history yet')).toBeInTheDocument();
  });
});
