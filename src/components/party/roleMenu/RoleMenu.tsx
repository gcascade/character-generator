import {
  ArrowDropDown as OpenIcon,
  Casino as RandomIcon,
} from '@mui/icons-material';
import { Chip, Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';
import React, { FC, useState } from 'react';
import { ROLE_IDS, roleLabel } from '../../../content/partyDepth';
import { useLocale, useT } from '../../../i18n';
import type { Gender } from '../../../types/character';
import type { RoleId } from '../../../types/party';

type RoleMenuProps = {
  role?: RoleId;
  gender: Gender;
  /** First name, for the accessible label. */
  name: string;
  /** Without it the role is shown read-only. */
  onChange?: (role: RoleId | 'random') => void;
};

/** A member's role, with a menu listing every role and "Random" (spec 008 US2). */
const RoleMenu: FC<RoleMenuProps> = ({ role, gender, name, onChange }) => {
  const t = useT();
  const { locale } = useLocale();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!role) return null;
  const labelText = roleLabel(role, gender, locale);

  if (!onChange) {
    return <Chip size="small" variant="outlined" label={labelText} />;
  }

  const choose = (value: RoleId | 'random') => {
    setAnchor(null);
    onChange(value);
  };

  return (
    <>
      <Chip
        size="small"
        variant="outlined"
        label={labelText}
        deleteIcon={<OpenIcon />}
        onDelete={(event) => setAnchor(event.currentTarget.parentElement)}
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={`${t('party.role', { name })}: ${labelText}`}
        aria-haspopup="menu"
        sx={{ color: 'secondary.main', borderColor: 'secondary.main' }}
      />
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {ROLE_IDS.map((id) => (
          <MenuItem key={id} selected={id === role} onClick={() => choose(id)}>
            {roleLabel(id, gender, locale)}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => choose('random')}>
          <ListItemIcon>
            <RandomIcon fontSize="small" />
          </ListItemIcon>
          {t('party.role.random')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default RoleMenu;
