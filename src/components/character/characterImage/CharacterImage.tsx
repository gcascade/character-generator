import { CharacterClass, CharacterRace, Gender } from '@Types/character';
import { CardMedia } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { isImage } from '../../../utils/image';
import './CharacterImage.css';
import { useLocale, useT } from '../../../i18n';
import { label } from '../../../content/labels';

const DEFAULT_IMAGE_PATH = `${import.meta.env.BASE_URL}images/default-portrait.png`;

type CharacterImageProps = {
  gender?: Gender;
  race?: CharacterRace;
  characterClass?: CharacterClass;
  height: string | number;
  width: string | number;
  /** Fill the frame and crop around the face instead of showing the whole image. */
  crop?: boolean;
  /** Opens the full image on click (off when the image is inside a link). */
  zoomable?: boolean;
};

const CharacterImage: FC<CharacterImageProps> = ({
  gender,
  race,
  characterClass,
  height,
  width,
  crop = false,
  zoomable = true,
}) => {
  const [portraitPath, setPortraitPath] = useState(DEFAULT_IMAGE_PATH);
  const t = useT();
  const { locale } = useLocale();

  useEffect(() => {
    const abortController = new AbortController();

    const imagePath =
      `${import.meta.env.BASE_URL}images/${race}/${characterClass}/${
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
      alt={
        race && characterClass
          ? `${label('race', race, gender ?? 'Male', locale)} ${label('class', characterClass, gender ?? 'Male', locale)}`
          : t('character.portrait')
      }
      onClick={zoomable ? handleClick : undefined}
      image={portraitPath}
      height={height}
      style={{ width: width }}
      sx={{
        cursor: zoomable ? 'zoom-in' : 'inherit',
        ...(crop && { objectFit: 'cover', objectPosition: 'center 15%' }),
      }}
    />
  );
};

export default CharacterImage;
