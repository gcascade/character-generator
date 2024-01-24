import { useContext, useCallback } from "react";
import { CharacterContext } from "../contexts/CharacterContext";
import { generateRandomCharacter } from "../utils/character";

const useCharacterGenerator = () => {
  const { setCharacter } = useContext(CharacterContext);
  const useRandomCharacter = () => {
    const generateNewCharacter = useCallback(() => {
      setCharacter(generateRandomCharacter());
    }, []);

    return { generateNewCharacter };
  };

  return useRandomCharacter();
};

export default useCharacterGenerator;
