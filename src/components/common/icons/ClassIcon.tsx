import {
  AutoFixHigh,
  EmojiSymbols,
  Security,
  VisibilityOff,
} from '@mui/icons-material';
import React, { FC } from 'react';
import { CharacterClass } from '../../../types/character';

type ClassIconProps = {
  characterClass: CharacterClass;
};

const ClassIcon: FC<ClassIconProps> = ({ characterClass }) => {
  switch (characterClass) {
    case 'Warrior':
      return <Security data-testid="warrior-icon" />;
    case 'Mage':
      return <AutoFixHigh data-testid="mage-icon" />;
    case 'Rogue':
      return <VisibilityOff data-testid="rogue-icon" />;
    case 'Cleric':
      return <EmojiSymbols data-testid="cleric-icon" />;
  }
};

export default ClassIcon;
