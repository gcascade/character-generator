import React from "react";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";

const CharacterTypography = ({ children }) => {
  const theme = useTheme();

  return (
    <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
      {children}
    </Typography>
  );
};

export default CharacterTypography;
