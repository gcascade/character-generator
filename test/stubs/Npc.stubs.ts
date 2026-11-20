import type { Npc } from '../../src/types/npc';

/** A fixed side character for tests and stories (spec 010). */
export const brennaThistledown: Npc = {
  firstName: 'Brenna',
  lastName: 'Thistledown',
  race: 'Halfling',
  gender: 'Female',
  age: 46,
  occupation: 'Innkeeper',
  content: {
    look: 'look-stout',
    daily: 'daily-innkeeper-kitchen',
    quirk: 'quirk-food',
    rumour: 'rumour-tavern',
    secret: 'secret-smuggler',
    opinion: 'opinion-greedy',
  },
};
