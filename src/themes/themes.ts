import {
  createTheme,
  responsiveFontSizes,
  type Theme,
} from '@mui/material/styles';
import type { CharacterClass, CharacterRace } from '../types/character';
import { BADGE_TEXT, CLASS, type Mode, RACE, TOKENS } from './palette';

declare module '@mui/material/styles' {
  interface Palette {
    menu: { main: string; contrastText: string };
    race: Record<CharacterRace, string>;
    characterClass: Record<CharacterClass, string>;
    badgeText: { main: string };
  }
  interface PaletteOptions {
    menu?: { main: string; contrastText: string };
    race?: Record<CharacterRace, string>;
    characterClass?: Record<CharacterClass, string>;
    badgeText?: { main: string };
  }
  interface TypographyVariants {
    story: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    story?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    story: true;
  }
}

export const DISPLAY_FONT = 'Cinzel, "Times New Roman", serif';
export const STORY_FONT = 'Alegreya, Georgia, serif';
export const UI_FONT = '"Alegreya Sans", "Segoe UI", Roboto, sans-serif';

const palette = (mode: Mode) => {
  const t = TOKENS[mode];
  return {
    primary: { main: t.primary, contrastText: t.onPrimary },
    secondary: { main: t.accent, contrastText: t.onPrimary },
    background: { default: t.background, paper: t.paper },
    text: { primary: t.text, secondary: t.textSecondary },
    divider: t.divider,
    menu: { main: t.menu, contrastText: t.onMenu },
    // Race and class colours, read as `race.Elf` / `characterClass.Mage` in sx (research R7).
    race: RACE[mode],
    characterClass: CLASS[mode],
    badgeText: { main: BADGE_TEXT[mode] },
  };
};

const display = {
  fontFamily: DISPLAY_FONT,
  fontWeight: 700,
  letterSpacing: '0.03em',
};

/**
 * Heroic fantasy theme (spec 005): parchment light mode and candle-lit dark
 * mode, Cinzel titles, Alegreya story text, Alegreya Sans interface.
 */
const theme: Theme = responsiveFontSizes(
  createTheme({
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: {
      light: { palette: palette('light') },
      dark: { palette: palette('dark') },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: UI_FONT,
      fontSize: 15,
      h1: { ...display, fontSize: '2.5rem' },
      h2: { ...display, fontSize: '2rem' },
      h3: { ...display, fontSize: '1.5rem' },
      h4: { ...display, fontSize: '1.3rem' },
      h5: { ...display, fontSize: '1.15rem' },
      h6: { ...display, fontSize: '1rem' },
      button: { fontWeight: 700, letterSpacing: '0.06em' },
      story: {
        fontFamily: STORY_FONT,
        fontSize: '1.125rem',
        lineHeight: 1.65,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            backgroundImage:
              'radial-gradient(ellipse at top, rgba(255,255,255,0.35), transparent 60%), radial-gradient(ellipse at bottom right, rgba(120,80,30,0.10), transparent 55%)',
            backgroundAttachment: 'fixed',
            ...theme.applyStyles('dark', {
              backgroundImage:
                'radial-gradient(ellipse at top, rgba(224,181,103,0.07), transparent 60%)',
            }),
          },
          ':focus-visible': {
            outline: `3px solid ${theme.vars?.palette.secondary.main}`,
            outlineOffset: 2,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              transitionDuration: '0.01ms !important',
            },
          },
        }),
      },
      // MUI buttons remove the browser outline; give keyboard focus a clear gold ring (FR-003).
      MuiButtonBase: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.Mui-focusVisible': {
              outline: `3px solid ${theme.vars?.palette.secondary.main}`,
              outlineOffset: 2,
            },
          }),
        },
      },
      MuiTypography: {
        defaultProps: { variantMapping: { story: 'p' } },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.vars?.palette.divider}`,
            borderRadius: 14,
            boxShadow: '0 8px 24px rgba(60,35,10,0.12)',
          }),
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingTop: 10, paddingBottom: 10 },
          outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
        },
      },
      MuiChip: {
        styleOverrides: { label: { fontWeight: 700, letterSpacing: '0.02em' } },
      },
    },
  }),
);

export default theme;
