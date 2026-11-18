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
import { Link } from 'react-router';
import { LOCALES, useLocale, useT } from '../../../i18n';
import './DrawerMenu.css';

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
        },
      }}
    >
      <Box
        sx={{
          padding: '16px',
          textAlign: 'center',
          backgroundColor: '#3f51b5',
          color: 'white',
        }}
      >
        <Typography variant="h6" noWrap>
          {t('nav.menu')}
        </Typography>
      </Box>
      <Divider />
      <List component="nav" aria-label={t('nav.label')} onClick={onClose}>
        <ListItemButton component={Link} to="/">
          <ListItemIcon className="listItemIcon">
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.generator')} />
        </ListItemButton>
        <ListItemButton component={Link} to="/characters">
          <ListItemIcon className="listItemIcon">
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.characters')} />
        </ListItemButton>
        <ListItemButton component={Link} to="/settings">
          <ListItemIcon className="listItemIcon">
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={t('nav.settings')} />
        </ListItemButton>
      </List>
      <Divider />
      <Box sx={{ mt: 'auto', p: 2, display: 'flex', justifyContent: 'center' }}>
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
      </Box>
    </Drawer>
  );
};

export default DrawerMenu;
