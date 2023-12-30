import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  CardHeader,
} from "@mui/material";

const Character = ({ character, onGenerate }) => {
  return (
    <Card
      sx={{ backgroundColor: "#f5f5f5", margin: "20px", borderRadius: "15px" }}
    >
      <CardHeader
        title={character.name}
        titleTypographyProps={{ align: "center" }}
      />
      <CardContent>
        <Typography variant="body1">
          <strong>Race:</strong> {character.race}
        </Typography>
        <Typography variant="body1">
          <strong>Class:</strong> {character.characterClass}
        </Typography>
        <Typography variant="body1">
          <strong>Gender:</strong> {character.gender}
        </Typography>
        <Typography variant="body1">
          <strong>Age:</strong> {character.age}
        </Typography>
        <Typography variant="body1">
          <strong>Alignment:</strong> {character.alignment}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {character.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={onGenerate}
        >
          New Character
        </Button>
      </CardActions>
    </Card>
  );
};

export default Character;
