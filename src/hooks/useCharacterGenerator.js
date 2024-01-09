import { useState, useCallback } from "react";
import characterNames from "../data/characterNames.json";
import backgrounds from "../data/backgrounds.json";

const MIN_AGE = 15;

const replacePlaceholders = (str, character) => {
  const { firstName, lastName, epithet } = character;

  return str
    .replace(/{{firstName}}/g, firstName)
    .replace(/{{lastName}}/g, lastName)
    .replace(/{{epithet}}/g, epithet);
};

const generateBackground = ({ firstName, lastName, epithet }) => {
  return {
    content: backgrounds[0].content.map((paragraph) =>
      replacePlaceholders(paragraph, { firstName, lastName, epithet })
    ),
    title: replacePlaceholders(backgrounds[0].title, {
      firstName,
      lastName,
      epithet,
    }),
  };
};

const useCharacterGenerator = () => {
  const races = [
    {
      name: "Human",
      maxAge: 100,
    },
    {
      name: "Elf",
      maxAge: 200,
    },
    {
      name: "Dwarf",
      maxAge: 400,
    },
    {
      name: "Orc",
      maxAge: 80,
    },
  ];
  const classes = ["Warrior", "Mage", "Rogue", "Cleric"];
  const genders = ["Male", "Female", "Non-binary"];
  const alignments = [
    "Lawful Good",
    "Neutral Good",
    "Chaotic Good",
    "Lawful Neutral",
    "True Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil",
  ];

  const getRandomItem = (array) =>
    array[Math.floor(Math.random() * array.length)];

  const generateRandomCharacter = () => {
    const randomRace = getRandomItem(races);
    const randomClass = getRandomItem(classes);
    const randomGender = getRandomItem(genders);

    const { firstName, lastName, epithet } = characterNames;

    const firstnamesForGender =
      randomGender === "Non-binary"
        ? firstName["Male"].concat(firstName["Female"])
        : firstName[randomGender];

    const randomFirstName =
      firstnamesForGender && firstnamesForGender.length > 0
        ? getRandomItem(firstnamesForGender)
        : `Character${Math.floor(Math.random() * 1000)}`;

    const randomLastName = getRandomItem(lastName);
    const randomEpithet = getRandomItem(epithet);
    const randomAge = Math.floor(Math.random() * randomRace.maxAge) + MIN_AGE;
    const randomAlignment = getRandomItem(alignments);

    const character = {
      firstName: randomFirstName,
      lastName: randomLastName,
      epithet: randomEpithet,
      race: randomRace.name,
      characterClass: randomClass,
      gender: randomGender,
      age: randomAge,
      alignment: randomAlignment,
    };

    return {
      ...character,
      description: generateBackground(character).content,
      background: generateBackground(character),
    };
  };

  const useRandomCharacter = () => {
    const [character, setCharacter] = useState(generateRandomCharacter());

    const generateNewCharacter = useCallback(() => {
      setCharacter(generateRandomCharacter());
    }, []);

    return { character, generateNewCharacter };
  };

  return useRandomCharacter();
};

export default useCharacterGenerator;
