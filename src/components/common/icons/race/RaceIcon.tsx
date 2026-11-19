import {
  Construction,
  Forest,
  PersonOutlined,
  SportsKabaddi,
} from '@mui/icons-material';
import React, { FC } from 'react';
import { CharacterRace } from '../../../../types/character';

type RaceIconsProps = {
  characterRace: CharacterRace;
};

const RaceIcon: FC<RaceIconsProps> = ({ characterRace }) => {
  switch (characterRace) {
    case 'Human':
      return (
        <PersonOutlined sx={{ color: 'race.Human' }} data-testid="human-icon" />
      );
    case 'Elf':
      return <Forest sx={{ color: 'race.Elf' }} data-testid="elf-icon" />;
    case 'Orc':
      return (
        <SportsKabaddi sx={{ color: 'race.Orc' }} data-testid="orc-icon" />
      );
    case 'Dwarf':
      return (
        <Construction sx={{ color: 'race.Dwarf' }} data-testid="dwarf-icon" />
      );
  }
};

export default RaceIcon;
