import { CharacterClass, CharacterRace, Gender } from '@Types/character';
import { CardMedia } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { isImage } from '../../../utils/image';
import './CharacterImage.css';

const DEFAULT_IMAGE_PATH = '/images/default-portrait.png';

type CharacterImageProps = {
  gender?: Gender;
  race?: CharacterRace;
  characterClass?: CharacterClass;
  height: string | number;
  width: string | number;
};

const CharacterImage: FC<CharacterImageProps> = ({
  gender,
  race,
  characterClass,
  height,
  width,
}) => {
  const [portraitPath, setPortraitPath] = useState(DEFAULT_IMAGE_PATH);

  useEffect(() => {
    const abortController = new AbortController();

    const imagePath =
      `${process.env.PUBLIC_URL}/images/${race}/${characterClass}/${
        gender === 'Non-binary'
          ? Math.random() < 0.5
            ? 'Male'
            : 'Female'
          : (gender as Gender)
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
    window.open(portraitPath, '_blank');
  };

  return (
    <CardMedia
      component="img"
      className="character-portrait"
      alt={`${race ?? 'unknown race'} ${characterClass ?? 'unknown class'}`}
      onClick={handleClick}
      image={portraitPath}
      height={height}
      style={{ width: width }}
      sx={{
        boxShadow:
          '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      }}
    />
  );
};

export default CharacterImage;
