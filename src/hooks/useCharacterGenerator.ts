import { useCallback, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import { generateRandomCharacter } from '../utils/character';

const useCharacterGenerator = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'useCharacterGenerator must be used within a CharacterProvider',
    );
  }
  const { character, setCharacter } = context;
  const useRandomCharacter = () => {
    const generateNewCharacter = useCallback(() => {
      setCharacter(generateRandomCharacter({}));
    }, []);

    const rerollCharacterProperty = useCallback(
      (property: keyof Character) => {
        setCharacter(
          generateRandomCharacter({ ...character, [property]: null }),
        );
      },
      [character],
    );

    return { generateNewCharacter, rerollCharacterProperty };
  };

  return useRandomCharacter();
};

export default useCharacterGenerator;
