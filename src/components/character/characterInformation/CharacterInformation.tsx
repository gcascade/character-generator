import React, { FC, useContext, useEffect, useState } from 'react';
import { CharacterContext } from '../../../contexts/CharacterContext';
import useAlert from '../../../hooks/useAlert';
import useCharacterRequest from '../../../hooks/useCharacterRequest';
import { Character } from '../../../types/character';
import CharacterProperty from '../characterProperty/CharacterProperty';

const CharacterInformation: FC = () => {
  const characterContext = useContext(CharacterContext);
  const [isRerollButtonDisabled, setIsRerollButtonDisabled] = useState(false);

  if (!characterContext) {
    throw new Error(
      'CharacterInformation must be used within a CharacterProvider',
    );
  }

  const { requestStatus, rerollCharacterProperty } = useCharacterRequest();

  const { addError, addSuccess } = useAlert();

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

  const handleButtonClick = (property: keyof Character) => {
    rerollCharacterProperty(property, {
      doneCallback: () => setIsRerollButtonDisabled(false),
      onSuccess: () => addSuccess('Updated character'),
      onError: addError,
    });
  };

  useEffect(() => {
    if (requestStatus !== 'loading') {
      setIsRerollButtonDisabled(false);
    } else {
      setIsRerollButtonDisabled(true);
    }
  }, [requestStatus]);

  return (
    <>
      <CharacterProperty
        label="First Name"
        value={firstName}
        onButtonClick={() => handleButtonClick('firstName')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Last Name"
        value={lastName}
        onButtonClick={() => handleButtonClick('lastName')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Epithet"
        value={epithet}
        onButtonClick={() => handleButtonClick('epithet')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Race"
        value={race}
        onButtonClick={() => handleButtonClick('race')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Class"
        value={characterClass}
        onButtonClick={() => handleButtonClick('characterClass')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Gender"
        value={gender}
        onButtonClick={() => handleButtonClick('gender')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Age"
        value={age}
        onButtonClick={() => handleButtonClick('age')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
      <CharacterProperty
        label="Alignment"
        value={alignment}
        onButtonClick={() => handleButtonClick('alignment')}
        isRerollButtonDisabled={isRerollButtonDisabled}
      />
    </>
  );
};

export default CharacterInformation;
