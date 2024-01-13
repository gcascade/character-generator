import React, { useState, useEffect } from "react";
import { CardMedia } from "@mui/material";
import "./Character.css";
import { isImage } from "../utils/image";
import { Genders } from "../constants/characterAttributes";

const CharacterImage = ({ character }) => {
  const { gender, race, characterClass } = character;

  const [portraitPath, setPortraitPath] = useState(
    "/images/default-portrait.jpg"
  );

  useEffect(() => {
    const abortController = new AbortController();

    let imagePath = `/images/${race}/${characterClass}/${
      gender === Genders.NON_BINARY
        ? Math.random() < 0.5
          ? Genders.MALE
          : Genders.FEMALE
        : gender
    }1.png`.toLowerCase();

    isImage(imagePath, abortController.signal).then((exists) => {
      if (abortController.signal.aborted) {
        return;
      }

      if (exists) {
        setPortraitPath(imagePath);
      } else {
        setPortraitPath("/images/default-portrait.jpg");
      }
    });

    return () => {
      abortController.abort();
    };
  }, [race, characterClass, gender]);

  return (
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
  );
};

export default CharacterImage;
