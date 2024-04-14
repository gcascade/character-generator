import { IconButton, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import RerollIcon from '../../common/icons/RerollIcon';

type RerollButtonProps = {
  tooltip?: string;
  onButtonClick: VoidFunction;
};

const RerollButton: FC<RerollButtonProps> = ({ tooltip, onButtonClick }) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onButtonClick();
        }}
        edge="end"
        size="small"
      >
        <RerollIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RerollButton;
