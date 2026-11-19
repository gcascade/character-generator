import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React, { FC } from 'react';
import RerollButton from '../../common/buttons/RerollButton';

type CharacterPropertyProps = {
  label: string;
  value: string | number;
  /** Tooltip of the reroll button, e.g. "Reroll the first name". */
  tooltip: string;
  onButtonClick: VoidFunction;
  isRerollButtonDisabled?: boolean;
  /** Whether the property is kept by the next generation (spec 003). */
  locked?: boolean;
  /** Shows the padlock when given. */
  onToggleLock?: VoidFunction;
  /** Label of the padlock, e.g. "Lock the race". */
  lockLabel?: string;
};

/**
 * One cell of the property grid (spec 005 R3): label above the value; the die
 * and padlock show on hover or keyboard focus, always when locked, and always
 * on touch screens.
 */
const CharacterProperty: FC<CharacterPropertyProps> = ({
  label,
  value,
  tooltip,
  onButtonClick,
  isRerollButtonDisabled,
  locked = false,
  onToggleLock,
  lockLabel,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      px: 1.25,
      py: 0.75,
      borderRadius: 2,
      minWidth: 0,
      '&:hover, &:focus-within': {
        bgcolor: 'rgba(154, 107, 18, 0.10)',
        '& .property-actions': { opacity: 1 },
      },
      '@media (hover: none)': { '& .property-actions': { opacity: 1 } },
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component="div"
        sx={{
          fontSize: '0.8rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{ fontWeight: 500, fontSize: '1.05rem', overflowWrap: 'anywhere' }}
      >
        {value}
      </Typography>
    </Box>
    <Box
      className="property-actions"
      sx={{
        display: 'flex',
        flexShrink: 0,
        opacity: locked ? 1 : 0,
        transition: 'opacity 0.15s',
      }}
    >
      {onToggleLock && (
        <Tooltip title={lockLabel}>
          <IconButton
            size="small"
            aria-label={lockLabel}
            aria-pressed={locked}
            onClick={onToggleLock}
            sx={{ color: locked ? 'secondary.main' : 'text.secondary' }}
          >
            {locked ? (
              <LockIcon fontSize="small" />
            ) : (
              <LockOpenIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}
      <RerollButton
        tooltip={tooltip}
        onButtonClick={onButtonClick}
        disabled={!!isRerollButtonDisabled}
      />
    </Box>
  </Box>
);

export default CharacterProperty;
