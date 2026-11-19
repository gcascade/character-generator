import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';
import '../../src/themes/fonts';
import theme from '../../src/themes/themes';

/** The app's theme; the toolbar "mode" global switches light and dark. */
const ThemeDecorator: Decorator = (Story, context) => (
  <ThemeProvider
    theme={theme}
    defaultMode={context.globals.mode ?? 'light'}
    key={context.globals.mode}
  >
    <CssBaseline enableColorScheme />
    <Story />
  </ThemeProvider>
);

export default ThemeDecorator;
