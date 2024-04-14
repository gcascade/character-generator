import React, { FC } from 'react';
import RerollButton from '../common/buttons/RerollButton';
import CharacterTypography from './CharacterTypography';

type CharacterPropertyProps = {
  label: string;
  value: string | number;
  onButtonClick: VoidFunction;
};

const CharacterProperty: FC<CharacterPropertyProps> = ({
  label,
  value,
  onButtonClick,
}) => {
  return (
    <CharacterTypography>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '5px' }}>{label}:</strong>
        <span>{value}</span>
        <RerollButton
          tooltip={`Reroll character's ${label.toLowerCase()}`}
          onButtonClick={onButtonClick}
        />
      </span>
    </CharacterTypography>
  );
};

export default CharacterProperty;
