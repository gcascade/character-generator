import { Group as GroupIcon } from '@mui/icons-material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { LOCALES, useLocale, useT } from '../../../i18n';
import './DrawerMenu.css';
import ColorModeToggle from '../../common/colorModeToggle/ColorModeToggle';

type DrawerMenuProps = {
  width: number;
  /** `permanent` on wide screens, `temporary` (opened from the app bar) on small ones. */
  variant?: 'permanent' | 'temporary';
  open?: boolean;
  onClose?: VoidFunction;
};

const DrawerMenu: React.FC<DrawerMenuProps> = ({
  width,
  variant = 'permanent',
  open = false,
  onClose,
}) => {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const { pathname } = useLocation();
  const item = (to: string) => ({
    component: Link,
    to,
    selected: to === '/' ? pathname === '/' : pathname.startsWith(to),
  });

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' || open}
      onClose={onClose}
      className="drawer"
      classes={{ paper: 'drawerPaper' }}
      anchor="left"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.2)',
          bgcolor: 'menu.main',
          color: 'menu.contrastText',
          borderRight: 'none',
        },
        '& .MuiListItemButton-root': {
          borderLeft: '3px solid transparent',
          '&.Mui-selected, &.Mui-selected:hover': {
            bgcolor: 'rgba(232, 211, 160, 0.14)',
            borderLeftColor: '#E0B567',
          },
          '&:hover': { bgcolor: 'rgba(232, 211, 160, 0.08)' },
        },
        '& .MuiDivider-root': { borderColor: 'rgba(232, 211, 160, 0.25)' },
        '& .MuiToggleButton-root': {
          color: 'inherit',
          borderColor: 'rgba(232, 211, 160, 0.4)',
          '&.Mui-selected': {
            color: 'inherit',
            bgcolor: 'rgba(232, 211, 160, 0.25)',
          },
        },
      }}
    >
      <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
        <Typography variant="h5" component="p" sx={{ lineHeight: 1.3 }}>
          {t('app.title')}
        </Typography>
      </Box>
      <Divider />
      <List component="nav" aria-label={t('nav.label')} onClick={onClose}>
        <ListItemButton {...item('/')}>
          <ListItemIcon className="listItemIcon">
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.generator')} />
        </ListItemButton>
        <ListItemButton {...item('/characters')}>
          <ListItemIcon className="listItemIcon">
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.characters')} />
        </ListItemButton>
        <ListItemButton {...item('/settings')}>
          <ListItemIcon className="listItemIcon">
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.settings')} />
        </ListItemButton>
      </List>
      <Divider />
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
        }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={locale}
          aria-label={t('language.switch')}
          onChange={(_, value) => value && setLocale(value)}
        >
          {LOCALES.map((code) => (
            <ToggleButton
              key={code}
              value={code}
              aria-label={t(`language.${code}`)}
              lang={code}
            >
              {code.toUpperCase()}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ColorModeToggle />
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
