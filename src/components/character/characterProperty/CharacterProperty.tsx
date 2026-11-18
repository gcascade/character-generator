import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import RerollButton from '../../common/buttons/RerollButton';
import CharacterTypography from '../characterTypography/CharacterTypography';
import { useT } from '../../../i18n';

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

const CharacterProperty: FC<CharacterPropertyProps> = ({
  label,
  value,
  tooltip,
  onButtonClick,
  isRerollButtonDisabled,
  locked = false,
  onToggleLock,
  lockLabel,
}) => {
  const t = useT();
  return (
    <CharacterTypography>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '5px', whiteSpace: 'nowrap' }}>
          {label}
          {t('punct.colon')}
        </strong>
        <span>{value}</span>
        {onToggleLock && (
          <Tooltip title={lockLabel}>
            <IconButton
              size="small"
              aria-label={lockLabel}
              aria-pressed={locked}
              color={locked ? 'primary' : 'default'}
              onClick={onToggleLock}
              sx={{ ml: 0.5 }}
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
      </span>
    </CharacterTypography>
  );
};

export default CharacterProperty;
