import { Menu as MenuIcon } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useState } from 'react';
import { BrowserRouter, useRoutes } from 'react-router';
import { AlertManagerProvider } from '../contexts/AlertManagerContext';
import { CharacterProvider } from '../contexts/CharacterContext';
import { DataProvider } from '../contexts/DataContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { RequestProvider } from '../contexts/RequestContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { LocaleProvider, useT } from '../i18n';
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
const initialCharacter = generateRandomCharacter({});

// Permanent side menu on wide screens; app bar + collapsible menu below `md`.
const AppLayout: React.FC = () => {
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Box sx={{ backgroundColor: 'background.paper', minHeight: '100vh' }}>
      <CssBaseline />
      {!isDesktop && (
        <AppBar position="sticky" sx={{ backgroundColor: '#3f51b5' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              aria-label={t('app.openMenu')}
              onClick={() => setIsMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" noWrap>
              {t('app.title')}
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <DrawerMenu
        width={drawerWidth}
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <Container
        component="main"
        maxWidth={false}
        sx={{
          padding: { xs: 1, sm: 3 },
          marginLeft: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <AlertManager />
        <AppRoutes />
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocaleProvider>
        <ErrorBoundary>
          <CharacterProvider initCharacter={initialCharacter}>
            <HistoryProvider>
              <SettingsProvider>
                <RequestProvider>
                  <AlertManagerProvider>
                    <DataProvider>
                      <BrowserRouter basename={import.meta.env.BASE_URL}>
                        <AppLayout />
                      </BrowserRouter>
                    </DataProvider>
                  </AlertManagerProvider>
                </RequestProvider>
              </SettingsProvider>
            </HistoryProvider>
          </CharacterProvider>
        </ErrorBoundary>
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default App;
