import type { Locale } from '../i18n';
import type { CharacterRace } from '../types/character';
import {
  type LockableNpcProperty,
  NPC_SECTIONS,
  type Npc,
  type NpcContentRefs,
  type NpcSection,
  type NpcTemplate,
  type Occupation,
  Occupations,
} from '../types/npc';
import { NAMES, NPC_FRAGMENTS, NPC_TEXTS, OCCUPATIONS } from './data';
import { renderText } from './renderText';
import {
  compatibleRaceGenders,
  firstNamesFor,
  MAX_AGE,
  MIN_AGE,
} from './template';

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

/** Picks a different item when possible. */
const pickOther = <T>(items: readonly T[], current: T): T => {
  const others = items.filter((item) => item !== current);
  return pick(others.length ? others : items);
};

const OCCUPATION_LIST = Object.values(Occupations);

/** Youngest age for an occupation (research R3). */
export const minAgeOf = (occupation: Occupation) =>
  Math.max(
    MIN_AGE,
    OCCUPATIONS.find((o) => o.id === occupation)?.minAge ?? MIN_AGE,
  );

/** Oldest age the app draws for a race: few NPCs live at the very edge of their lifespan. */
const maxAgeOf = (race: CharacterRace) => Math.floor(MAX_AGE[race] * 0.9);

const randomAge = (race: CharacterRace, occupation: Occupation) => {
  const low = minAgeOf(occupation);
  const high = Math.max(low, maxAgeOf(race));
  return low + Math.floor(Math.random() * (high - low + 1));
};

/** Fragment ids of a section; daily-life fragments are those of the occupation. */
export const npcFragmentIds = (section: NpcSection, occupation: Occupation) =>
  NPC_FRAGMENTS.filter(
    (f) =>
      f.section === section &&
      (f.occupation === undefined || f.occupation === occupation),
  ).map((f) => f.id);

const pickSheet = (occupation: Occupation): NpcContentRefs =>
  Object.fromEntries(
    NPC_SECTIONS.map((section) => [
      section,
      pick(npcFragmentIds(section, occupation)),
    ]),
  ) as NpcContentRefs;

const sheetUnlike = (occupation: Occupation, previous?: Npc) => {
  const content = pickSheet(occupation);
  const same = (section: NpcSection) =>
    previous?.content[section] === content[section];
  if (same('rumour') && same('secret') && same('quirk')) {
    content.rumour = pickOther(
      npcFragmentIds('rumour', occupation),
      content.rumour,
    );
  }
  return content;
};

/** Occupations allowed for an age (a locked age excludes those that need an older person). */
const occupationsFor = (age: number | undefined) =>
  OCCUPATION_LIST.filter((o) => age === undefined || minAgeOf(o) <= age);

/** A new NPC keeping every value of the template and drawing the others (contracts/npc.md). */
export const generateNpc = (
  template: NpcTemplate = {},
  /** The NPC shown before: the new one never repeats all of its rumour, secret and quirk (SC-003). */
  previous?: Npc,
): Npc => {
  const { race, gender } = pick(compatibleRaceGenders(template));
  const allowed = occupationsFor(template.age);
  const occupation =
    template.occupation ?? pick(allowed.length ? allowed : OCCUPATION_LIST);
  return {
    firstName: template.firstName ?? pick(firstNamesFor(race, gender)),
    lastName: template.lastName ?? pick(NAMES[race].last),
    race,
    gender,
    age: template.age ?? randomAge(race, occupation),
    occupation,
    content: sheetUnlike(occupation, previous),
  };
};

/** Several NPCs with different first names (research R4). */
export const generateNpcs = (count: number, template: NpcTemplate = {}) => {
  const npcs: Npc[] = [];
  // A locked first name cannot be shared by five people: names are drawn for each.
  const rest = { ...template };
  delete rest.firstName;
  for (
    let attempt = 0;
    npcs.length < count && attempt < count * 20;
    attempt++
  ) {
    const npc = generateNpc(rest);
    if (!npcs.some((other) => other.firstName === npc.firstName)) {
      npcs.push(npc);
    }
  }
  while (npcs.length < count) npcs.push(generateNpc(rest));
  return npcs;
};

const withoutText = (npc: Npc): Npc => {
  const copy = { ...npc };
  delete copy.text;
  return copy;
};

/** The locked values of an NPC. */
export const npcTemplateOf = (
  npc: Npc,
  locked: readonly LockableNpcProperty[],
): NpcTemplate =>
  Object.fromEntries(locked.map((property) => [property, npc[property]]));

/**
 * Rerolls one property or one sheet section with the app's content: only it
 * changes, with what must follow (names keep, age adapts). Returns the same
 * NPC when no other value fits the locked properties. AI text is dropped.
 */
export const rerollNpc = (
  npc: Npc,
  target: LockableNpcProperty | NpcSection,
  locked: readonly LockableNpcProperty[] = [],
): Npc => {
  if ((NPC_SECTIONS as readonly string[]).includes(target)) {
    const section = target as NpcSection;
    const ids = npcFragmentIds(section, npc.occupation);
    if (ids.length < 2) return npc;
    return {
      ...withoutText(npc),
      content: {
        ...npc.content,
        [section]: pickOther(ids, npc.content[section]),
      },
    };
  }
  const others = npcTemplateOf(
    npc,
    locked.filter((p) => p !== target),
  );
  switch (target as LockableNpcProperty) {
    case 'race': {
      const races = [
        ...new Set(
          compatibleRaceGenders({ ...others, gender: npc.gender })
            .map((pair) => pair.race)
            .filter((race) => race !== npc.race),
        ),
      ];
      if (!races.length) return npc;
      const race = pick(races);
      return {
        ...withoutText(npc),
        race,
        age: locked.includes('age')
          ? npc.age
          : Math.max(
              minAgeOf(npc.occupation),
              Math.min(npc.age, maxAgeOf(race)),
            ),
      };
    }
    case 'gender': {
      const genders = [
        ...new Set(
          compatibleRaceGenders({ ...others, race: npc.race })
            .map((pair) => pair.gender)
            .filter((gender) => gender !== npc.gender),
        ),
      ];
      if (!genders.length) return npc;
      const gender = pick(genders);
      const names = firstNamesFor(npc.race, gender);
      const firstName =
        locked.includes('firstName') || names.includes(npc.firstName)
          ? npc.firstName
          : pick(names);
      return { ...withoutText(npc), gender, firstName };
    }
    case 'age': {
      const low = minAgeOf(npc.occupation);
      if (maxAgeOf(npc.race) <= low) return npc;
      let age = npc.age;
      while (age === npc.age) age = randomAge(npc.race, npc.occupation);
      return { ...withoutText(npc), age };
    }
    case 'occupation': {
      const choices = occupationsFor(
        locked.includes('age') ? npc.age : undefined,
      ).filter((o) => o !== npc.occupation);
      if (!choices.length) return npc;
      const occupation = pick(choices);
      return {
        ...withoutText(npc),
        occupation,
        age: Math.max(npc.age, minAgeOf(occupation)),
        content: {
          ...npc.content,
          daily: pick(npcFragmentIds('daily', occupation)),
        },
      };
    }
    case 'firstName':
      return {
        ...withoutText(npc),
        firstName: pickOther(
          firstNamesFor(npc.race, npc.gender),
          npc.firstName,
        ),
      };
    case 'lastName':
      return {
        ...withoutText(npc),
        lastName: pickOther(NAMES[npc.race].last, npc.lastName),
      };
    default:
      return npc;
  }
};

export type RenderedNpc = Record<NpcSection, string> & {
  /** Set when the sheet was written in another language (AI text). */
  writtenIn?: Locale;
  writtenByAi: boolean;
};

/** The sheet of an NPC in the interface language; AI text is shown as written. */
export const renderNpc = (npc: Npc, locale: Locale): RenderedNpc => {
  if (npc.text) {
    const { language, ...rest } = npc.text;
    const sections = Object.fromEntries(
      NPC_SECTIONS.map((section) => [section, rest[section]]),
    ) as Record<NpcSection, string>;
    return {
      ...sections,
      writtenByAi: true,
      ...(language !== locale && { writtenIn: language }),
    };
  }
  const names = { firstName: npc.firstName, lastName: npc.lastName };
  const sections = Object.fromEntries(
    NPC_SECTIONS.map((section) => [
      section,
      renderText(NPC_TEXTS[locale][npc.content[section]], npc.gender, names),
    ]),
  ) as Record<NpcSection, string>;
  return { ...sections, writtenByAi: false };
};
