import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { CharacterProvider } from '../contexts/CharacterContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { RequestProvider } from '../contexts/RequestContext';
import routes from '../routes';
import theme from '../themes/themes';
import { generateRandomCharacter } from '../utils/character';
import DrawerMenu from './navigation/DrawerMenu';

const AppRoutes = () => {
  const routing = useRoutes(routes);
  return routing;
};

const drawerWidth = 240;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CharacterProvider initCharacter={generateRandomCharacter({})}>
        <HistoryProvider>
          <RequestProvider>
            <BrowserRouter>
              <Box
                style={{
                  backgroundColor: 'red',
                }}
              >
                <CssBaseline />
                <DrawerMenu width={drawerWidth} />
                <Container
                  component="main"
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    padding: '24px',
                    marginLeft: `${drawerWidth}px`,
                    minWidth: `calc(100% - ${drawerWidth}px)`,
                    minHeight: '100vh',
                  }}
                >
                  <AppRoutes />
                </Container>
              </Box>
            </BrowserRouter>
          </RequestProvider>
        </HistoryProvider>
      </CharacterProvider>
    </ThemeProvider>
  );
};

export default App;
