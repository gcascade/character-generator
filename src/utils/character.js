import characterNames from "../data/characterNames.json";
import backgrounds from "../data/backgrounds.json";
import {
  Races,
  Classes,
  Genders,
  Alignments,
} from "../constants/characterAttributes";

const MIN_AGE = 15;

const replacePlaceholders = (str, character) => {
  const { firstName, lastName, epithet } = character;

  return str
    .replace(/{{firstName}}/g, firstName)
    .replace(/{{lastName}}/g, lastName)
    .replace(/{{epithet}}/g, epithet);
};

const getDefaultBackground = (gender) => {
  return backgrounds.find(
    (background) =>
      background.gender === gender &&
      background.race === Races.DEFAULT.name &&
      background.characterClass === Classes.DEFAULT &&
      background.alignment === Alignments.DEFAULT
  );
};

const generateBackground = (character) => {
  const {
    firstName,
    lastName,
    epithet,
    characterClass,
    gender,
    race,
    alignment,
  } = character;

  const backgroundsFiltered = backgrounds.filter(
    (b) =>
      b.characterClass === characterClass &&
      b.alignment === alignment &&
      b.gender === gender &&
      b.race === race
  );

  const background =
    backgroundsFiltered.length > 0
      ? backgroundsFiltered[
          Math.floor(Math.random() * backgroundsFiltered.length)
        ]
      : getDefaultBackground(gender);

  return {
    content: background.content.map((paragraph) =>
      replacePlaceholders(paragraph, { firstName, lastName, epithet })
    ),
    title: replacePlaceholders(background.title, {
      firstName,
      lastName,
      epithet,
    }),
  };
};

const races = Object.values(Races).filter((race) => race !== Races.DEFAULT);
const classes = Object.values(Classes).filter((cls) => cls !== Classes.DEFAULT);
const genders = Object.values(Genders);
const alignments = Object.values(Alignments).filter(
  (alignment) => alignment !== Alignments.DEFAULT
);

const getRandomItem = (array) =>
  array[Math.floor(Math.random() * array.length)];

export const generateRandomCharacter = () => {
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
  const randomAge = Math.floor(Math.random() * randomRace.maxAge) + MIN_AGE;
  const randomAlignment = getRandomItem(alignments);
  const randomEpithet = getRandomItem(epithet);

  const character = {
    firstName: randomFirstName,
    lastName: randomLastName,
    race: randomRace.name,
    characterClass: randomClass,
    gender: randomGender,
    epithet: randomEpithet,
    age: randomAge,
    alignment: randomAlignment,
  };

  return {
    ...character,
    background: generateBackground(character),
  };
};
