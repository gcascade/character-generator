import { Typography, useTheme } from '@mui/material';
import React, { FC } from 'react';

const EmptyHistory: FC = () => {
  const theme = useTheme();
  return (
    <Typography
      component="p"
      variant="body1"
      align="center"
      sx={{ color: theme.palette.text.primary }}
    >
      No history yet
    </Typography>
  );
};

export default EmptyHistory;
