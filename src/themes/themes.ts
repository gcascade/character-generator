import { createTheme, Theme } from '@mui/material/styles';

const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      dark: '#135193',
    },
    secondary: {
      main: '#FF4081',
      dark: '#C60055',
    },
    background: {
      paper: '#F5F5DC',
    },
    text: {
      primary: '#333',
      secondary: '#777',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
  },
});

export default theme;
