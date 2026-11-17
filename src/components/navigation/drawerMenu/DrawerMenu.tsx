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
  Typography,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router';
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
          Menu
        </Typography>
      </Box>
      <Divider />
      <List component="nav" aria-label="Main navigation" onClick={onClose}>
        <ListItemButton component={Link} to="/">
          <ListItemIcon className="listItemIcon">
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Character Generator" />
        </ListItemButton>
        <ListItemButton component={Link} to="/characters">
          <ListItemIcon className="listItemIcon">
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="My Characters" />
        </ListItemButton>
        {/* <ListItemButton component={Link} to="/import-export">
          <ListItemIcon className="listItemIcon">
            <ImportExportIcon />
          </ListItemIcon>
          <ListItemText primary="Import/Export" />
        </ListItemButton> */}
        <ListItemButton component={Link} to="/settings">
          <ListItemIcon className="listItemIcon">
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
      <Divider />
    </Drawer>
  );
};

export default DrawerMenu;
