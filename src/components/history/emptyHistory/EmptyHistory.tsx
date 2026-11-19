import { Typography } from '@mui/material';
import React, { FC } from 'react';
import { useT } from '../../../i18n';

const EmptyHistory: FC = () => {
  const t = useT();
  return (
    <Typography
      component="p"
      variant="body1"
      align="center"
      sx={{ color: 'text.secondary' }}
    >
      {t('history.empty')}
    </Typography>
  );
};

export default EmptyHistory;
