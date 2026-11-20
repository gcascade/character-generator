import {
  AutoFixHigh,
  EmojiSymbols,
  Hiking,
  MusicNote,
  Security,
  Shield,
  Spa,
  VisibilityOff,
  Whatshot,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import React, { FC } from 'react';
import { CharacterClass } from '../../../../types/character';
import { slug } from '../../../../content/slug';
import { classToken } from '../../../../themes/palette';

type ClassIconProps = {
  characterClass: CharacterClass;
};

const ICONS: Record<CharacterClass, SvgIconComponent> = {
  Warrior: Security,
  Mage: AutoFixHigh,
  Rogue: VisibilityOff,
  Cleric: EmojiSymbols,
  Ranger: Hiking,
  Paladin: Shield,
  Bard: MusicNote,
  Druid: Spa,
  Barbarian: Whatshot,
};

const ClassIcon: FC<ClassIconProps> = ({ characterClass }) => {
  const Icon = ICONS[characterClass];
  return (
    <Icon
      sx={{ color: classToken(characterClass) }}
      data-testid={`${slug(characterClass)}-icon`}
    />
  );
};

export default ClassIcon;
