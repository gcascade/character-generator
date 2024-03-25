import backgrounds from '../data/backgrounds.json';
import characterNames from '../data/characterNames.json';
import {
  Character,
  CharacterAlignment,
  CharacterAlignments,
  CharacterBackground,
  CharacterClass,
  CharacterClasses,
  CharacterRace,
  CharacterRaces,
  Gender,
  Genders,
} from '../types/character';

const MIN_AGE = 15;

const replacePlaceholders = (str: string, character: Character) => {
  const { firstName, lastName, epithet } = character;

  return str
    .replace(/{{firstName}}/g, firstName)
    .replace(/{{lastName}}/g, lastName)
    .replace(/{{epithet}}/g, epithet);
};

const getDefaultBackground = (gender: Gender) => {
  return backgrounds.find(
    (background) =>
      background.gender === gender &&
      background.race === 'Any' &&
      background.characterClass === 'Any' &&
      background.alignment === 'Any',
  );
};

type CharacterProps = Character & {
  background: CharacterBackground | undefined;
};

const generateBackground = (character: CharacterProps) => {
  const { characterClass, gender, race, alignment } = character;

  const backgroundsFiltered = backgrounds.filter(
    (b) =>
      b.characterClass === characterClass &&
      b.alignment === alignment &&
      b.gender === gender &&
      b.race === race,
  );

  const background =
    backgroundsFiltered.length > 0
      ? backgroundsFiltered[
          Math.floor(Math.random() * backgroundsFiltered.length)
        ]
      : getDefaultBackground(gender);

  return {
    content: background?.content.map((paragraph) =>
      replacePlaceholders(paragraph, character),
    ),
    title: background
      ? replacePlaceholders(background?.title, character)
      : 'Title',
  };
};

const races = Object.values(CharacterRaces);
const classes = Object.values(CharacterClasses);
const genders = Object.values(Genders);
const alignments = Object.values(CharacterAlignments);

const getRandomItem = (array: string[]) =>
  array[Math.floor(Math.random() * array.length)];

const maxAgeByCharacterRace: Record<CharacterRace, number> = {
  Human: 85,
  Elf: 500,
  Dwarf: 400,
  Orc: 60,
};

const getRandomAge = (race: CharacterRace): number => {
  const maxAge = maxAgeByCharacterRace[race] ?? 100;
  return Math.floor(Math.random() * maxAge) + MIN_AGE;
};

export const generateRandomCharacter = () => {
  const randomRace = getRandomItem(races) as CharacterRace;
  const randomClass = getRandomItem(classes) as CharacterClass;
  const randomGender = getRandomItem(genders) as Gender;
  const randomAlignment = getRandomItem(alignments) as CharacterAlignment;

  const { firstName, lastName, epithet } = characterNames;

  const firstnamesForGender =
    randomGender === 'Non-binary'
      ? firstName['Male'].concat(firstName['Female'])
      : firstName[randomGender];

  const randomFirstName =
    firstnamesForGender && firstnamesForGender.length > 0
      ? getRandomItem(firstnamesForGender)
      : `Character${Math.floor(Math.random() * 1000)}`;

  const randomLastName = getRandomItem(lastName);
  const randomAge = getRandomAge(randomRace);
  const randomEpithet = getRandomItem(epithet);

  const character = {
    firstName: randomFirstName,
    lastName: randomLastName,
    race: randomRace,
    characterClass: randomClass,
    gender: randomGender,
    epithet: randomEpithet,
    age: randomAge,
    alignment: randomAlignment,
  } as CharacterProps;

  return {
    ...character,
    background: generateBackground(character),
  } as Character;
};
