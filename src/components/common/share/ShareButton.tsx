import { Share as ShareIcon } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import useShare, { type ShareTarget } from '../../../hooks/useShare';
import ShareDialog from './ShareDialog';

type ShareButtonProps = {
  label: string;
  /** Built when clicked, so the link always matches what is on screen. */
  target: () => ShareTarget;
  variant?: 'icon' | 'text';
  disabled?: boolean;
};

/** "Share" action, as an icon or a text button (spec 007). */
const ShareButton: FC<ShareButtonProps> = ({
  label,
  target,
  variant = 'text',
  disabled = false,
}) => {
  const { share, fallbackUrl, closeFallback } = useShare();
  const onClick = () => void share(target());

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title={label}>
          <IconButton
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            sx={{ color: 'text.secondary' }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button startIcon={<ShareIcon />} onClick={onClick} disabled={disabled}>
          {label}
        </Button>
      )}
      <ShareDialog url={fallbackUrl} onClose={closeFallback} />
    </>
  );
};

export default ShareButton;
