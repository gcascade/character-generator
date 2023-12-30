import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CardActions,
  CardHeader,
} from "@mui/material";

const Character = ({ character, onGenerate }) => {
  const theme = useTheme();

  return (
    <Card
      data-testid="character-card"
      sx={{
        backgroundColor: theme.palette.background.paper,
        margin: "20px",
        borderRadius: "15px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <CardHeader
        title={character.name}
        titleTypographyProps={{ align: "center" }}
      />
      <CardContent>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          <strong>Race:</strong> {character.race}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          <strong>Class:</strong> {character.characterClass}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          <strong>Gender:</strong> {character.gender}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          <strong>Age:</strong> {character.age}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          <strong>Alignment:</strong> {character.alignment}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
          <strong>Description:</strong> {character.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            transition: "background-color 0.5s ease-in-out",
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
