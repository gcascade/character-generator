import { Container, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { CharacterProvider } from '../contexts/CharacterContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { RequestProvider } from '../contexts/RequestContext';
import routes from '../routes';
import theme from '../themes/themes';
import { generateRandomCharacter } from '../utils/character';

const AppRoutes = () => {
  const routing = useRoutes(routes);
  return routing;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CharacterProvider initCharacter={generateRandomCharacter({})}>
        <HistoryProvider>
          <RequestProvider>
            <BrowserRouter>
              <CssBaseline />
              {/* <Navbar /> */}
              <Container
                component="main"
                maxWidth="xl"
                sx={{
                  backgroundColor: theme.palette.background.default,
                  padding: '24px',
                }}
              >
                <AppRoutes />
              </Container>
            </BrowserRouter>
          </RequestProvider>
        </HistoryProvider>
      </CharacterProvider>
    </ThemeProvider>
  );
};

export default App;
