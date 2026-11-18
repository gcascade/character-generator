import { Typography, useTheme } from '@mui/material';
import React, { FC } from 'react';
import { useT } from '../../../i18n';

const EmptyHistory: FC = () => {
  const t = useT();
  const theme = useTheme();
  return (
    <Typography
      component="p"
      variant="body1"
      align="center"
      sx={{ color: theme.palette.text.primary }}
    >
      {t('history.empty')}
    </Typography>
  );
};

export default EmptyHistory;
