import { Box, Container, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AlertManagerProvider } from '../contexts/AlertManagerContext';
import { CharacterProvider } from '../contexts/CharacterContext';
import { DataProvider } from '../contexts/DataContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { RequestProvider } from '../contexts/RequestContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import routes from '../routes';
import theme from '../themes/themes';
import { generateRandomCharacter } from '../utils/character';
import AlertManager from './common/alert/AlertManager';
import ErrorBoundary from './common/error/ErrorBoundary';
import DrawerMenu from './navigation/drawerMenu/DrawerMenu';

const AppRoutes = () => {
  const routing = useRoutes(routes);
  return routing;
};

const drawerWidth = 240;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <CharacterProvider initCharacter={generateRandomCharacter({})}>
          <HistoryProvider>
            <SettingsProvider>
              <RequestProvider>
                <AlertManagerProvider>
                  <DataProvider>
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
                  </DataProvider>
                </AlertManagerProvider>
              </RequestProvider>
            </SettingsProvider>
          </HistoryProvider>
        </CharacterProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
