import React, { useState } from 'react';
import Character from './Character';

const races = ['Human', 'Elf', 'Dwarf', 'Orc'];
const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric'];

const generateRandomCharacter = () => {
  const randomName = `Character${Math.floor(Math.random() * 1000)}`;
  const randomRace = races[Math.floor(Math.random() * races.length)];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const randomDescription = `A brave ${randomRace} ${randomClass} ready for adventure.`;

  return {
    name: randomName,
    race: randomRace,
    characterClass: randomClass,
    description: randomDescription,
  };
};

const CharacterGenerator = () => {
  const [character, setCharacter] = useState(generateRandomCharacter);

  const generateNewCharacter = () => {
    setCharacter(generateRandomCharacter());
  };

  return (
    <div>
      <h1>RPG Character Generator</h1>
      <button onClick={generateNewCharacter}>Generate Character</button>
      <Character character={character} />
    </div>
  );
};

export default CharacterGenerator;