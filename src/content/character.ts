import type { Locale } from '../i18n';
import type {
  Character,
  CharacterBackground,
  ContentRefs,
} from '../types/character';
import { TEXTS } from './data';
import { capitalize, renderText, selectGender } from './renderText';

/** What the interface shows for a character in a given language. */
export type RenderedCharacter = {
  /** Epithet as it appears in a sentence, e.g. "the Bold" / "la Hardie". */
  epithet: string;
  background: CharacterBackground;
  /** Language of AI or legacy text, when it differs from the interface language. */
  writtenIn?: Locale;
  /** Who wrote the text shown in another language. */
  writtenBy?: 'ai' | 'legacy';
};

const renderEpithet = (
  content: ContentRefs,
  character: Character,
  locale: Locale,
) => selectGender(TEXTS[locale].epithet[content.epithetId], character.gender);

/**
 * Renders a character in the interface language: app content follows the
 * language; AI or legacy text is shown as written (FR-008, FR-015, FR-016).
 */
export const renderCharacter = (
  character: Character,
  locale: Locale,
): RenderedCharacter => {
  const { content } = character;
  const epithet =
    character.epithet ??
    (content ? renderEpithet(content, character, locale) : '');

  const names = {
    firstName: character.firstName,
    lastName: character.lastName,
    epithet,
  };
  const text = (category: keyof (typeof TEXTS)['en'], id: string) =>
    renderText(TEXTS[locale][category][id], character.gender, names);

  const background: CharacterBackground =
    character.background ??
    (content
      ? {
          title: text('title', content.titleId),
          content: [
            text('origin', content.originId),
            text('training', content.trainingId),
            text('turningPoint', content.turningPointId),
            text('goal', content.goalId),
          ],
        }
      : { title: capitalize(epithet), content: [] });

  const hasText =
    character.epithet !== undefined || character.background !== undefined;
  const textLanguage = character.textLanguage ?? 'en';
  const shownInAnotherLanguage = hasText && textLanguage !== locale;

  return {
    epithet,
    background,
    writtenIn: shownInAnotherLanguage ? textLanguage : undefined,
    writtenBy: shownInAnotherLanguage
      ? (character.textSource ?? 'legacy')
      : undefined,
  };
};
