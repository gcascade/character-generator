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

const getRandomFirstName = (
  firstnamesForGender: string[],
): string | undefined => {
  return firstnamesForGender && firstnamesForGender.length > 0
    ? getRandomItem(firstnamesForGender)
    : `Character${Math.floor(Math.random() * 1000)}`;
};

export const generateRandomCharacter = (
  characterTemplate: Partial<Character>,
) => {
  const race =
    characterTemplate.race ?? (getRandomItem(races) as CharacterRace);
  const characterClass =
    characterTemplate.characterClass ??
    (getRandomItem(classes) as CharacterClass);
  const gender = characterTemplate.gender ?? (getRandomItem(genders) as Gender);
  const alignment =
    characterTemplate.alignment ??
    (getRandomItem(alignments) as CharacterAlignment);

  const { firstNames, lastNames, epithets } = characterNames;

  const firstnamesForGender =
    gender === 'Non-binary'
      ? firstNames['Male'].concat(firstNames['Female'])
      : firstNames[gender];

  const firstName =
    characterTemplate.firstName ?? getRandomFirstName(firstnamesForGender);

  const lastName = characterTemplate.lastName ?? getRandomItem(lastNames);
  const age = characterTemplate.age ?? getRandomAge(race);
  const epithet = characterTemplate.epithet ?? getRandomItem(epithets);

  const character = {
    firstName: firstName,
    lastName: lastName,
    race: race,
    characterClass: characterClass,
    gender: gender,
    epithet: epithet,
    age: age,
    alignment: alignment,
  } as CharacterProps;

  return {
    ...character,
    background: generateBackground(character),
  } as Character;
};
