import { CharacterClass, CharacterRace, Gender } from '@Types/character';
import { CardMedia } from '@mui/material';
import React, { FC, useContext } from 'react';
import { PortraitContext } from '../../../contexts/PortraitContext';
import { ageBand, sameTraits } from '../../../content/portraitPrompt';
import PaintedImage from '../../portrait/paintedImage/PaintedImage';
import portraitFiles from '../../../data/content/portraitFiles.json';
import './CharacterImage.css';
import { useLocale, useT } from '../../../i18n';
import { label } from '../../../content/labels';
import { slug } from '../../../content/slug';
import RaceEmblem from '../raceEmblem/RaceEmblem';

const PORTRAIT_FILES: readonly string[] = portraitFiles;

const DEFAULT_IMAGE_PATH = `${import.meta.env.BASE_URL}images/default-portrait.png`;

/**
 * Portrait file of a character, from the list of existing files (spec 011 R5);
 * `undefined` when there is none. Non-binary characters use the masculine or
 * feminine portrait, chosen from their name so that the same character always
 * shows the same portrait, on every page.
 */
export const portraitFor = (
  race: CharacterRace,
  characterClass: CharacterClass,
  gender: Gender,
  name = '',
): string | undefined => {
  const variant =
    gender === 'Non-binary'
      ? [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 2 === 0
        ? 'Male'
        : 'Female'
      : gender;
  const stem = `${slug(race)}/${slug(characterClass)}/${variant.toLowerCase()}1.`;
  const file = PORTRAIT_FILES.find((path) => path.startsWith(stem));
  return file && `${import.meta.env.BASE_URL}images/${file}`;
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
  /** A portrait painted by AI (spec 011): shown instead of the default one. */
  portraitId?: string;
  /** Tells whether a painted portrait is outdated (age band). */
  age?: number;
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
  portraitId,
  age,
}) => {
  const painted = useContext(PortraitContext)?.get(portraitId);
  const t = useT();
  const { locale } = useLocale();
  const portraitPath =
    race && characterClass && gender
      ? portraitFor(race, characterClass, gender, `${firstName} ${lastName}`)
      : DEFAULT_IMAGE_PATH;

  const alt =
    race && characterClass
      ? `${label('race', race, gender ?? 'Male', locale)} ${label('class', characterClass, gender ?? 'Male', locale)}`
      : t('character.portrait');

  if (painted) {
    const outdated =
      !!race &&
      !!characterClass &&
      !!gender &&
      !sameTraits(painted.traits, {
        race,
        gender,
        role: characterClass,
        ageBand:
          age === undefined ? painted.traits.ageBand : ageBand(race, age),
      });
    return (
      <PaintedImage
        image={painted.image}
        alt={alt}
        height={height}
        width={width}
        crop={crop}
        zoomable={zoomable}
        outdated={outdated}
      />
    );
  }

  if (!portraitPath && race && characterClass) {
    // No portrait yet for this race and class: show its emblem (spec 009).
    return (
      <RaceEmblem
        race={race}
        characterClass={characterClass}
        gender={gender}
        height={height}
        width={width}
      />
    );
  }

  return (
    <CardMedia
      component="img"
      className="character-portrait"
      alt={alt}
      onClick={zoomable ? () => window.open(portraitPath, '_blank') : undefined}
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
