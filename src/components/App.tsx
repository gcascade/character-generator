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
import { generateRandomCharacter } from '../content/generate';
import { loadLocks } from '../content/storedLocks';
import { LOCKABLE_PROPERTIES } from '../content/template';
import { LockProvider } from '../contexts/LockContext';
import { PartyProvider } from '../contexts/PartyContext';
import { NpcProvider } from '../contexts/NpcContext';
import { PortraitProvider } from '../contexts/PortraitContext';
import AlertManager from './common/alert/AlertManager';
import ErrorBoundary from './common/error/ErrorBoundary';
import DrawerMenu from './navigation/drawerMenu/DrawerMenu';

const AppRoutes = () => {
  const routing = useRoutes(routes);
  return routing;
};

const drawerWidth = 240;

// Permanent side menu on wide screens; app bar + collapsible menu below `md`.
const AppLayout: React.FC = () => {
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <CssBaseline enableColorScheme />
      {!isDesktop && (
        <AppBar
          position="sticky"
          sx={{ bgcolor: 'menu.main', color: 'menu.contrastText' }}
        >
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

/** Locks saved on this device and a first character that respects them (spec 003 FR-009). */
const loadStart = () => {
  const template = loadLocks();
  return {
    character: generateRandomCharacter(template),
    locked: LOCKABLE_PROPERTIES.filter((property) => property in template),
  };
};

const App: React.FC = () => {
  const [start] = useState(loadStart);
  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <LocaleProvider>
        <ErrorBoundary>
          <CharacterProvider initCharacter={start.character}>
            <LockProvider initialLocked={start.locked}>
              <HistoryProvider>
                <SettingsProvider>
                  <RequestProvider>
                    <AlertManagerProvider>
                      <DataProvider>
                        <PartyProvider>
                          <NpcProvider>
                            <PortraitProvider>
                              <BrowserRouter
                                basename={import.meta.env.BASE_URL}
                              >
                                <AppLayout />
                              </BrowserRouter>
                            </PortraitProvider>
                          </NpcProvider>
                        </PartyProvider>
                      </DataProvider>
                    </AlertManagerProvider>
                  </RequestProvider>
                </SettingsProvider>
              </HistoryProvider>
            </LockProvider>
          </CharacterProvider>
        </ErrorBoundary>
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default App;
