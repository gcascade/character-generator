import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AlertManagerProvider } from '../contexts/AlertManagerContext';
import { CharacterProvider } from '../contexts/CharacterContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { RequestProvider } from '../contexts/RequestContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import routes from '../routes';
import theme from '../themes/themes';
import { generateRandomCharacter } from '../utils/character';
import AlertManager from './common/alert/AlertManager';
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
          <SettingsProvider>
            <RequestProvider>
              <AlertManagerProvider>
                <BrowserRouter>
                  <Box
                    style={{
                      backgroundColor: theme.palette.background.paper,
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
                      <AlertManager width={`${drawerWidth}px`} />
                      <AppRoutes />
                    </Container>
                  </Box>
                </BrowserRouter>
              </AlertManagerProvider>
            </RequestProvider>
          </SettingsProvider>
        </HistoryProvider>
      </CharacterProvider>
    </ThemeProvider>
  );
};

export default App;
