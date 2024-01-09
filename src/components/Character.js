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

const Gender = ({ gender }) => {
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

const CharacterBackground = ({ background }) => {
  if (!background || !background.content) {
    return null;
  }

  const { content, title } = background;

  return (
    <>
      <CharacterTypography>
        <strong>History:</strong>
      </CharacterTypography>
      <Typography className="background-title">{title}</Typography>
      {content.map((paragraph, index) => (
        <div key={index} style={{ padding: "5px" }}>
          <CharacterTypography>{paragraph}</CharacterTypography>
        </div>
      ))}
    </>
  );
};

const Character = ({ character, onGenerate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    firstName,
    lastName,
    gender,
    race,
    characterClass,
    age,
    alignment,
    background,
    epithet,
  } = character;

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
          <span data-testid="character-name">{`${firstName} ${lastName}`}</span>
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
            {race} {characterClass}
            <Gender gender={gender} />
          </div>
        }
        subheaderTypographyProps={{ align: "center", variant: "subtitle1" }}
      />
      {!isMobile && (
        <CardMedia
          component="img"
          className="character-portrait"
          alt={`${race} ${characterClass}`}
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
          <strong>First Name:</strong> {firstName}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Last Name:</strong> {lastName}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Epithet:</strong> {epithet}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Race:</strong> {race}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Class:</strong> {characterClass}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Gender:</strong> {gender}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Age:</strong> {age}
        </CharacterTypography>
        <CharacterTypography>
          <strong>Alignment:</strong> {alignment}
        </CharacterTypography>
        <CharacterBackground background={background} />
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
