import { Box, Typography } from '@mui/material';
import React from 'react';

type PageTitleProps = {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  gutterBottom?: boolean;
};

/** Page heading in the display lettering, with a small ornament below (spec 005). */
const PageTitle: React.FC<PageTitleProps> = ({
  children,
  variant = 'h2',
  align = 'center',
  gutterBottom = true,
}) => (
  <Box sx={{ mb: gutterBottom ? 3 : 0 }}>
    <Typography
      variant={variant}
      component="h1"
      align={align}
      sx={{ color: 'primary.main', mb: 0.5 }}
    >
      {children}
    </Typography>
    <Box
      aria-hidden
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        color: 'secondary.main',
        '&::before, &::after': {
          content: '""',
          height: '1px',
          width: 'min(120px, 25vw)',
          background: (theme) =>
            `linear-gradient(90deg, transparent, ${theme.vars?.palette.secondary.main})`,
        },
        '&::after': { transform: 'scaleX(-1)' },
      }}
    >
      ✦
    </Box>
  </Box>
);

export default PageTitle;
