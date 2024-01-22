import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Button,
  CardActions,
  CardHeader,
  useMediaQuery,
} from "@mui/material";
import { Male, Female, Transgender } from "@mui/icons-material";
import CharacterImage from "./CharacterImage";
import "./Character.css";
import CharacterBackground from "./CharacterBackground";
import CharacterInformation from "./CharacterInformation";

const Gender = ({ gender }) => {
  const className = `gender-icon ${gender.toLowerCase()}`;

  switch (gender) {
    case "Male":
      return <Male className={className} />;
    case "Female":
      return <Female className={className} />;
    case "Non-binary":
      return <Transgender className={className} />;
    default:
      return null;
  }
};

const Character = ({ character, onGenerate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { firstName, lastName, gender, race, characterClass, background } =
    character;

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
      <CardContent style={{ display: "flex" }}>
        {!isMobile && <CharacterImage character={character} />}
        <div style={{ marginLeft: "20px", width: "70%" }}>
          <CharacterInformation character={character} />
          <CharacterBackground background={background} />
        </div>
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
