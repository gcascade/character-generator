import {
  AutoFixHigh,
  EmojiSymbols,
  Security,
  VisibilityOff,
} from '@mui/icons-material';
import React, { FC } from 'react';
import { CharacterClass } from '../../../../types/character';

type ClassIconProps = {
  characterClass: CharacterClass;
};

const ClassIcon: FC<ClassIconProps> = ({ characterClass }) => {
  switch (characterClass) {
    case 'Warrior':
      return (
        <Security
          sx={{ color: 'characterClass.Warrior' }}
          data-testid="warrior-icon"
        />
      );
    case 'Mage':
      return (
        <AutoFixHigh
          sx={{ color: 'characterClass.Mage' }}
          data-testid="mage-icon"
        />
      );
    case 'Rogue':
      return (
        <VisibilityOff
          sx={{ color: 'characterClass.Rogue' }}
          data-testid="rogue-icon"
        />
      );
    case 'Cleric':
      return (
        <EmojiSymbols
          sx={{ color: 'characterClass.Cleric' }}
          data-testid="cleric-icon"
        />
      );
  }
};

export default ClassIcon;
