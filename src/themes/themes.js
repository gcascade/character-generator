import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976D2",
      dark: "#135193",
    },
    secondary: {
      main: "#FF4081",
      dark: "#C60055",
    },
    background: {
      paper: "#F5F5DC",
    },
    text: {
      primary: "#333",
      secondary: "#777",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
  },
  overrides: {
    MuiButton: {
      expandable: {
        color: "textPrimary",
        fontSize: "body1.fontSize",
        fontFamily: "fontFamily",
        textTransform: "none",
        border: `1px solid palette.secondary`,
        borderRadius: "4px",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          color: "#000",
        },
        "&:active": {
          backgroundColor: "#ccc",
          color: "#000",
        },
        "&:focus": {
          outline: "none",
          boxShadow: "0 0 0 3px rgba(0, 123, 255, 0.5)",
        },
      },
    },
  },
});

export default theme;
