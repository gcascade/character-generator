import React, { FC, useContext } from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import useCharacterGenerator from '../../hooks/useCharacterGenerator';
import CharacterProperty from './CharacterProperty';

const CharacterInformation: FC = () => {
  const characterContext = useContext(CharacterContext);

  if (!characterContext) {
    throw new Error(
      'CharacterInformation must be used within a CharacterProvider',
    );
  }

  const { rerollCharacterProperty } = useCharacterGenerator();

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
  } = characterContext;

  return (
    <>
      <CharacterProperty
        label="First Name"
        value={firstName}
        onButtonClick={() => rerollCharacterProperty('firstName')}
      />
      <CharacterProperty
        label="Last Name"
        value={lastName}
        onButtonClick={() => rerollCharacterProperty('lastName')}
      />
      <CharacterProperty
        label="Epithet"
        value={epithet}
        onButtonClick={() => rerollCharacterProperty('epithet')}
      />
      <CharacterProperty
        label="Race"
        value={race}
        onButtonClick={() => rerollCharacterProperty('race')}
      />
      <CharacterProperty
        label="Class"
        value={characterClass}
        onButtonClick={() => rerollCharacterProperty('characterClass')}
      />
      <CharacterProperty
        label="Gender"
        value={gender}
        onButtonClick={() => rerollCharacterProperty('gender')}
      />
      <CharacterProperty
        label="Age"
        value={age}
        onButtonClick={() => rerollCharacterProperty('age')}
      />
      <CharacterProperty
        label="Alignment"
        value={alignment}
        onButtonClick={() => rerollCharacterProperty('alignment')}
      />
    </>
  );
};

export default CharacterInformation;
