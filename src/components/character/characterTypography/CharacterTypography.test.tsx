import { ThemeProvider, createTheme } from '@mui/material/styles';
import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import * as CharacterTypographyStories from './CharacterTypography.stories';

const { Default } = composeStories(CharacterTypographyStories);

describe('CharacterTypography', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Default />
      </ThemeProvider>,
    );
  });

  it('displays the correct text', () => {
    render(
      <ThemeProvider theme={createTheme()}>
        <Default />
      </ThemeProvider>,
    );

    expect(screen.getByText('Lorem Ipsum')).toBeInTheDocument();
  });
});
