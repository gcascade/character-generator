import { Typography } from '@mui/material';
import React from 'react';

type PageTitleProps = {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  gutterBottom?: boolean;
};

const PageTitle: React.FC<PageTitleProps> = ({
  children,
  variant = 'h2',
  align = 'center',
  gutterBottom = true,
}) => (
  <Typography
    variant={variant}
    component="h1"
    align={align}
    gutterBottom={gutterBottom}
  >
    {children}
  </Typography>
);

export default PageTitle;
