import {
  Construction,
  Cottage,
  DarkMode,
  Diversity3,
  Forest,
  LocalFireDepartment,
  PersonOutlined,
  Settings,
  SportsKabaddi,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import React, { FC } from 'react';
import { CharacterRace } from '../../../../types/character';
import { slug } from '../../../../content/slug';
import { raceToken } from '../../../../themes/palette';

type RaceIconsProps = {
  characterRace: CharacterRace;
};

const ICONS: Record<CharacterRace, SvgIconComponent> = {
  Human: PersonOutlined,
  Elf: Forest,
  Dwarf: Construction,
  Orc: SportsKabaddi,
  Halfling: Cottage,
  Gnome: Settings,
  'Half-elf': Diversity3,
  'Dark elf': DarkMode,
  Ashborn: LocalFireDepartment,
};

const RaceIcon: FC<RaceIconsProps> = ({ characterRace }) => {
  const Icon = ICONS[characterRace];
  return (
    <Icon
      sx={{ color: raceToken(characterRace) }}
      data-testid={`${slug(characterRace)}-icon`}
    />
  );
};

export default RaceIcon;
