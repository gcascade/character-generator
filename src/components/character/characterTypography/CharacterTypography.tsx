import { Typography } from '@mui/material';
import React, { FC } from 'react';

type CharacterTypographyProps = {
  children: React.ReactNode;
};

const CharacterTypography: FC<CharacterTypographyProps> = ({ children }) => {
  return (
    <Typography variant="body1" sx={{ color: 'text.primary' }}>
      {children}
    </Typography>
  );
};

export default CharacterTypography;
