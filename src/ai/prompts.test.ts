import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import {
  backgroundRewritePrompt,
  nameRerollPrompt,
  newCharacterPrompt,
  SYSTEM_PROMPT,
} from './prompts';

describe('prompts', () => {
  it('states the fixed facts and the expected fields for a new character', () => {
    const { system, prompt } = newCharacterPrompt(korvusBlackiron);
    expect(system).toBe(SYSTEM_PROMPT);
    expect(system).toMatch(/JSON/);
    for (const fact of [
      'Race: Orc',
      'Class: Warrior',
      'Gender: Male',
      'Alignment: Lawful Good',
      'Age: 48',
    ]) {
      expect(prompt).toContain(fact);
    }
    expect(prompt).toContain('"firstName"');
    expect(prompt).toContain('"background"');
    expect(prompt).toMatch(/4 to 6 paragraphs/);
  });

  it('asks only for a background after a rules value changed', () => {
    const { prompt, schema } = backgroundRewritePrompt(
      { ...korvusBlackiron, epithet: 'The Unyielding', characterClass: 'Mage' },
      'characterClass',
    );
    expect(prompt).toContain('class has just changed');
    expect(prompt).toContain('Class: Mage');
    expect(prompt).toContain('Name: Korvus Blackiron');
    expect(
      schema.safeParse({ background: { title: 't', content: ['p'] } }).success,
    ).toBe(true);
    expect(prompt).not.toContain('"firstName"');
  });

  it('asks for a different value and a matching background on a name reroll', () => {
    const { prompt, schema } = nameRerollPrompt(
      { ...korvusBlackiron, epithet: 'The Unyielding' },
      'epithet',
    );
    expect(prompt).toContain('different from "The Unyielding"');
    expect(prompt).toContain('"epithet"');
    expect(
      schema.safeParse({
        epithet: 'The Bold',
        background: { title: 't', content: ['p'] },
      }).success,
    ).toBe(true);
  });
});
