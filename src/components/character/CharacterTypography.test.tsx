import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CharacterTypography from './CharacterTypography';

describe('CharacterTypography', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterTypography>Test</CharacterTypography>
      </ThemeProvider>,
    );
  });

  it('displays the correct text', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <CharacterTypography>Test</CharacterTypography>
      </ThemeProvider>,
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
