import { IconButton, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import RerollIcon from '../../common/icons/RerollIcon';

type RerollButtonProps = {
  onButtonClick: VoidFunction;
  tooltip?: string;
  disabled?: boolean;
};

const RerollButton: FC<RerollButtonProps> = ({
  tooltip,
  onButtonClick,
  disabled,
}) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onButtonClick();
        }}
        edge="end"
        size="small"
        disabled={disabled}
        data-testid="reroll-button"
      >
        <RerollIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RerollButton;
