import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { FC } from 'react';

type CharacterTypographyProps = {
  children: React.ReactNode;
};

const CharacterTypography: FC<CharacterTypographyProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
      {children}
    </Typography>
  );
};

export default CharacterTypography;
