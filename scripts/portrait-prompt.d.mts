export type ScriptPortraitSubject = {
  race: string;
  gender: string;
  ageBand: string;
  characterClass?: string;
  occupation?: string;
  look?: string;
};

export function buildPortraitPrompt(subject: ScriptPortraitSubject): {
  positive: string;
  negative: string;
};

export function defaultPortraitSubject(
  race: string,
  characterClass: string,
  variant: 'male' | 'female',
): ScriptPortraitSubject;
