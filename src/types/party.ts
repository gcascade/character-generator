import type { Locale } from '../i18n';
import type { CharacterTemplate } from '../content/template';
import type { Character } from './character';

export type AlignmentMode = 'harmonious' | 'anything';

/** Values every member of the party must have ("Any" when absent). */
export type PartyConstraints = Pick<
  CharacterTemplate,
  'race' | 'characterClass' | 'gender' | 'alignment'
>;

export type RoleId = string;

export type PartyMember = {
  id: string;
  character: Character;
  /** Kept when the party is generated again. */
  locked: boolean;
  /** Function in the group (spec 008); always set on new parties. */
  role?: RoleId;
};

/** A tie between two members (spec 008); `from` and `to` are member ids. */
export type Tie = { id: string; type: string; from: string; to: string };

export type HookRefs = { placeId: string; patronId: string; threatId: string };

export type BalanceArea =
  'fighting' | 'magic' | 'healing' | 'stealth' | 'talking';

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
  /** Ties between members; absent on parties made before spec 008. */
  ties?: Tie[];
  /** Adventure starting point (spec 008). */
  hook?: HookRefs;
  /** AI-written name, story and hook; override `content` / `hook` when present. */
  text?: {
    name: string;
    story: string[];
    hook?: string;
    language: Locale;
    source: 'ai';
  };
};
