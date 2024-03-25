import { useCallback, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { generateRandomCharacter } from '../utils/character';

const useCharacterGenerator = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'useCharacterGenerator must be used within a CharacterProvider',
    );
  }
  const { setCharacter } = context;
  const useRandomCharacter = () => {
    const generateNewCharacter = useCallback(() => {
      setCharacter(generateRandomCharacter());
    }, []);

    return { generateNewCharacter };
  };

  return useRandomCharacter();
};

export default useCharacterGenerator;
