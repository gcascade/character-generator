import { CharacterClass, CharacterRace, Gender } from '@Types/character';
import { CardMedia } from '@mui/material';
import React, { FC, useEffect, useState } from 'react';
import { isImage } from '../../../utils/image';
import './CharacterImage.css';
import { useLocale, useT } from '../../../i18n';
import { label } from '../../../content/labels';

const DEFAULT_IMAGE_PATH = `${import.meta.env.BASE_URL}images/default-portrait.png`;

/**
 * Portrait file of a character. Non-binary characters use the masculine or
 * feminine portrait, chosen from their name so that the same character always
 * shows the same portrait, on every page.
 */
export const portraitFor = (
  race: CharacterRace,
  characterClass: CharacterClass,
  gender: Gender,
  name = '',
) => {
  const variant =
    gender === 'Non-binary'
      ? [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 2 === 0
        ? 'Male'
        : 'Female'
      : gender;
  return `${import.meta.env.BASE_URL}images/${race}/${characterClass}/${variant}1.png`.toLowerCase();
};

type CharacterImageProps = {
  gender?: Gender;
  race?: CharacterRace;
  characterClass?: CharacterClass;
  /** Picks the portrait of non-binary characters (see portraitFor). */
  firstName?: string;
  lastName?: string;
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
  firstName = '',
  lastName = '',
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

    if (!race || !characterClass || !gender) return;
    const imagePath = portraitFor(
      race,
      characterClass,
      gender,
      `${firstName} ${lastName}`,
    );

    isImage(imagePath, abortController.signal).then((exists) => {
      if (abortController.signal.aborted) {
        return;
      }

      setPortraitPath(exists ? imagePath : DEFAULT_IMAGE_PATH);
    });

    return () => {
      abortController.abort();
    };
  }, [race, characterClass, gender, firstName, lastName]);

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
