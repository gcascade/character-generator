import React from "react";
import {
  Container,
  CssBaseline,
  Paper,
  Typography,
  ThemeProvider,
} from "@mui/material";
import Character from "./Character";
import theme from "../themes/themes";
import useCharacterGenerator from "../hooks/useCharacterGenerator";

const CharacterGenerator = () => {
  const { character, generateNewCharacter } = useCharacterGenerator();

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          backgroundColor: theme.palette.background.default,
          padding: "24px",
        }}
      >
        <CssBaseline />
        <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
          <Typography
            component="h1"
            variant="h5"
            align="center"
            sx={{ color: theme.palette.text.primary }}
          >
            RPG Character Generator
          </Typography>
          <Character character={character} onGenerate={generateNewCharacter} />
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default CharacterGenerator;
