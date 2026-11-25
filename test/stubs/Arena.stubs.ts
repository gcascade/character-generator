import type { ArenaSetup, Contestant } from '@Types/arena';
import type { Character } from '@Types/character';

const character = (
  firstName: string,
  lastName: string,
  race: Character['race'],
  characterClass: Character['characterClass'],
  gender: Character['gender'],
  alignment: Character['alignment'],
  age: number,
): Character => ({
  firstName,
  lastName,
  race,
  characterClass,
  gender,
  alignment,
  age,
  epithet: '',
  background: { title: '', content: [] },
});

const solo = (id: string, c: Character, items: string[] = []): Contestant => ({
  id,
  character: c,
  sideId: id,
  perks: [],
  items,
});

/** A small, fixed arena: a team of two and three solo contestants. */
export const arenaSetup: ArenaSetup = {
  seed: 'storybook',
  shownRounds: 0,
  contestants: [
    {
      id: 'aela',
      character: character(
        'Aela',
        'Brightwind',
        'Elf',
        'Ranger',
        'Female',
        'Neutral Good',
        120,
      ),
      sideId: 'team',
      role: 'role-leader',
      perks: ['perk-sharpshooter'],
      items: ['item-bow'],
    },
    {
      id: 'brom',
      character: character(
        'Brom',
        'Ironfoot',
        'Dwarf',
        'Cleric',
        'Male',
        'Lawful Good',
        140,
      ),
      sideId: 'team',
      role: 'role-healer',
      perks: [],
      items: ['item-healing-potion'],
    },
    solo(
      'korvus',
      character(
        'Korvus',
        'Blackiron',
        'Orc',
        'Warrior',
        'Male',
        'Lawful Evil',
        40,
      ),
      ['item-axe'],
    ),
    solo(
      'sil',
      character(
        'Sil',
        'Quickfingers',
        'Halfling',
        'Rogue',
        'Non-binary',
        'Chaotic Neutral',
        35,
      ),
    ),
    solo(
      'vey',
      character(
        'Vey',
        'Ashmantle',
        'Ashborn',
        'Mage',
        'Female',
        'Neutral Evil',
        60,
      ),
      ['item-wand'],
    ),
  ],
  sides: [
    {
      id: 'team',
      kind: 'team',
      name: 'The Lanterns of Greywater',
      ties: [{ id: 't1', type: 'tie-childhood', from: 'aela', to: 'brom' }],
    },
    { id: 'korvus', kind: 'solo', ties: [] },
    { id: 'sil', kind: 'solo', ties: [] },
    { id: 'vey', kind: 'solo', ties: [] },
  ],
};
