import { useState, useCallback } from "react";
import characterNames from "../data/characterNames.json";

const MIN_AGE = 15;

const useCharacterGenerator = () => {
  const races = [
    {
      name: "Human",
      maxAge: 100,
      background:
        "Born into a diverse society, adapting to various cultures and professions.",
    },
    {
      name: "Elf",
      maxAge: 200,
      background:
        "An ancient race with a deep connection to nature and a profound appreciation for art and beauty.",
    },
    {
      name: "Dwarf",
      maxAge: 400,
      background:
        "Hailing from underground realms, skilled in craftsmanship and known for their resilience.",
    },
    {
      name: "Orc",
      maxAge: 80,
      background:
        "A proud and fierce warrior, living by the strong bonds of their tribal community.",
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

  const classBackgrounds = {
    Warrior:
      "A seasoned veteran of numerous battles, honing their combat skills on the front lines.",
    Mage: "A scholar of arcane mysteries, delving into ancient tomes to harness the power of magic.",
    Rogue:
      "A skilled infiltrator and master of stealth, navigating the shadows with finesse.",
    Cleric:
      "A devoted follower of divine forces, serving as a healer and protector of the faithful.",
  };

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
    const randomAge =
      Math.floor(Math.random() * randomRace.maxAge - MIN_AGE) + MIN_AGE;
    const randomAlignment = getRandomItem(alignments);

    const raceDescription = `A ${randomRace.name.toLowerCase()} with a rich cultural heritage. ${
      randomRace.background
    }`;
    const classDescription = `Skilled in the ways of ${randomClass.toLowerCase()}, ready to face any challenge. ${
      classBackgrounds[randomClass]
    }`;
    const genderDescription = `Identifying as ${randomGender.toLowerCase()}, this character brings a unique perspective to their adventures.`;
    const ageDescription = `With ${randomAge} years of experience, wisdom is etched into every line on their face.`;
    const alignmentDescription = `Guided by a moral compass, this character follows the path of ${randomAlignment.toLowerCase()}.`;

    const randomDescription = `${raceDescription} ${classDescription} ${genderDescription} ${ageDescription} ${alignmentDescription}`;

    return {
      firstName: randomFirstName,
      lastName: randomLastName,
      epithet: randomEpithet,
      race: randomRace.name,
      characterClass: randomClass,
      gender: randomGender,
      age: randomAge,
      alignment: randomAlignment,
      description: randomDescription,
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
