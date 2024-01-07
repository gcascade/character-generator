import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  CardMedia,
  CardHeader,
  useMediaQuery,
} from "@mui/material";
import { Male, Female, Transgender } from "@mui/icons-material";
import "./Character.css";

const getGenderIcon = (gender) => {
  switch (gender) {
    case "Male":
      return <Male sx={{ color: "blue" }} />;
    case "Female":
      return <Female sx={{ color: "pink" }} />;
    case "Non-binary":
      return <Transgender sx={{ color: "purple" }} />;
    default:
      return null;
  }
};

const CharacterTypography = ({ children }) => {
  const theme = useTheme();

  return (
    <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
      {children}
    </Typography>
  );
};

const Character = ({ character, onGenerate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const portraitPath = "/images/default-portrait.jpg";

  return (
    <Card
      data-testid="character-card"
      className="paper-card"
      sx={{
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardHeader
        title={
          <span data-testid="character-name">{`${character.firstName} ${character.lastName}`}</span>
        }
        titleTypographyProps={{ align: "center", variant: "h4" }}
        subheader={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {character.race} {character.characterClass}
            {getGenderIcon(character.gender)}
          </div>
        }
        subheaderTypographyProps={{ align: "center", variant: "subtitle1" }}
      />
      {!isMobile && (
        <CardMedia
          component="img"
          className="character-portrait"
          alt={`${character.race} ${character.characterClass}`}
          image={portraitPath}
          height="140"
          sx={{
            boxShadow:
              "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />
      )}
      <CardContent>
        <CharacterTypography>
          <strong>First Name:</strong> {character.firstName}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Last Name:</strong> {character.lastName}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Race:</strong> {character.race}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Class:</strong> {character.characterClass}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Gender:</strong> {character.gender}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Age:</strong> {character.age}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Alignment:</strong> {character.alignment}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Description:</strong> {character.description}
        </CharacterTypography>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            transition: "background-color 0.5s, color 0.5s ease-in-out",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          onClick={onGenerate}
        >
          New Character
        </Button>
      </CardActions>
    </Card>
  );
};

export default Character;
