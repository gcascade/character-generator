import React, { FC, useContext } from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import RaceIcon from '../common/icons/RaceIcon';
import CharacterTypography from './CharacterTypography';

const CharacterInformation: FC = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'CharacterInformation must be used within a CharacterProvider',
    );
  }

  const {
    character: {
      firstName,
      lastName,
      epithet,
      race,
      characterClass,
      gender,
      age,
      alignment,
    },
  } = context;

  return (
    <>
      <CharacterTypography>
        <strong>First Name:</strong> {firstName}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Last Name:</strong> {lastName}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Epithet:</strong> {epithet}
      </CharacterTypography>
      <CharacterTypography>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <strong style={{ marginRight: '5px' }}>Race:</strong>
          <span style={{ marginRight: '5px' }}>{race}</span>
          <RaceIcon characterRace={race} />
        </span>
      </CharacterTypography>
      <CharacterTypography>
        <strong>Class:</strong> {characterClass}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Gender:</strong> {gender}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Age:</strong> {age}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Alignment:</strong> {alignment}
      </CharacterTypography>
    </>
  );
};

export default CharacterInformation;
