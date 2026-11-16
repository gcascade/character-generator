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

const ClassIcon: FC<RaceIconsProps> = ({ characterRace }) => {
  switch (characterRace) {
    case 'Human':
      return <PersonOutlined data-testid="human-icon" />;
    case 'Elf':
      return <Forest style={{ color: 'green' }} data-testid="elf-icon" />;
    case 'Orc':
      return <SportsKabaddi data-testid="orc-icon" />;
    case 'Dwarf':
      return <Construction data-testid="dwarf-icon" />;
  }
};

export default ClassIcon;
