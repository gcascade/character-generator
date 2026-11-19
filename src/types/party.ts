import type { Locale } from '../i18n';
import type { CharacterTemplate } from '../content/template';
import type { Character } from './character';

export type AlignmentMode = 'harmonious' | 'anything';

/** Values every member of the party must have ("Any" when absent). */
export type PartyConstraints = Pick<
  CharacterTemplate,
  'race' | 'characterClass' | 'gender' | 'alignment'
>;

export type PartyMember = {
  id: string;
  character: Character;
  /** Kept when the party is generated again. */
  locked: boolean;
};

export type PartyContentRefs = {
  nameId: string;
  meetingId: string;
  goalId: string;
};

export type Party = {
  id: string;
  members: PartyMember[];
  constraints: PartyConstraints;
  alignmentMode: AlignmentMode;
  content: PartyContentRefs;
  /** AI-written name and story; overrides `content` when present. */
  text?: { name: string; story: string[]; language: Locale; source: 'ai' };
};
