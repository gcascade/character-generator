import React, { useState, useEffect, useContext } from "react";
import { CardMedia } from "@mui/material";
import "./CharacterImage.css";
import { isImage } from "../utils/image";
import { Genders } from "../constants/characterAttributes";
import { CharacterContext } from "../contexts/CharacterContext";

const IMAGE_SIZE = 512;
const DEFAULT_IMAGE_PATH = "/images/default-portrait.png";

const CharacterImage = () => {
  const {
    character: { gender, race, characterClass },
  } = useContext(CharacterContext);
  const [portraitPath, setPortraitPath] = useState(DEFAULT_IMAGE_PATH);

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

      setPortraitPath(exists ? imagePath : DEFAULT_IMAGE_PATH);
    });

    return () => {
      abortController.abort();
    };
  }, [race, characterClass, gender]);

  const handleClick = () => {
    window.open(portraitPath, "_blank");
  };

  return (
    <CardMedia
      component="img"
      className="character-portrait"
      alt={`${race} ${characterClass}`}
      onClick={handleClick}
      image={portraitPath}
      height={IMAGE_SIZE}
      style={{ width: "30%" }}
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
