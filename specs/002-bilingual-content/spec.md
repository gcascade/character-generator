# Feature Specification: Bilingual App and Fragment-Based Content

**Feature Branch**: `claude/cool-keller-vpldvo`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Bilingual app (English and French) and richer generated content built from composable fragments. Today the UI and all content are English only, backgrounds are 46 hand-written full texts (mostly Human Warriors, duplicated per gender, so most characters get the same generic background); names are not tied to race, there are 3x more female than male first names, and non-binary characters get names from the female/male lists. Goals: every UI text and generated content in English and French, language picked by the user (browser default, remembered), app content re-rendered on language change; backgrounds assembled from fragments (origin by race, training by class, turning point by alignment, current goal) with placeholders for names, pronouns and French gender agreement; names by race with gender-neutral first names; translated epithets agreeing in gender; AI writes in the current language and its text is labelled with its language. Out of scope: new races or classes, stats, portraits, other languages."

## Clarifications

### Session 2026-11-17

- Q: How does French text refer to non-binary characters? → A: Neutral phrasing that avoids gendered words; no neopronoun and no inclusive punctuation.
- Q: What happens to AI-written text when the user switches language? → A: It stays as written with its label, and a "Translate with AI" action rewrites it in the current language when an AI provider is configured.
- Q: What happens to the 46 existing hand-written backgrounds? → A: They are replaced by fragments; their best passages are recycled as fragments (origins, trainings, turning points).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Using the app in French (Priority: P1)

A French-speaking visitor opens the site. Because their browser is set to French, the whole interface is in French: menu, buttons, labels, alerts, settings, and the generated character itself (race, class, alignment, epithet, background). They can switch to English at any time from a visible language selector, and the choice is remembered on their next visit.

**Why this priority**: The constitution requires both languages; the interface is the first thing a French user sees, and every later story depends on texts being translatable.

**Independent Test**: With a French browser, open the site, generate a character, visit every page: no English text remains. Switch to English: no French text remains. Reload: the chosen language is kept.

**Acceptance Scenarios**:

1. **Given** a first visit with a browser preferring French, **When** the home page opens, **Then** every text is in French.
2. **Given** a first visit with a browser preferring any other language, **When** the home page opens, **Then** every text is in English.
3. **Given** the app in French, **When** the user picks English in the language selector, **Then** every text switches to English immediately without reloading, including the character shown.
4. **Given** a user who picked a language, **When** they come back later, **Then** the app opens in that language whatever the browser prefers.
5. **Given** a female Dwarf Warrior shown in French, **When** the user reads the summary, **Then** the class and alignment agree with her gender (e.g. "Naine Guerrière", "Loyale Bonne").

---

### User Story 2 - Varied, coherent backgrounds for every character (Priority: P1)

A user generates many characters of different races, classes, alignments and genders. Each background reads as one coherent story built from the character's race (where they come from), class (how they trained), alignment (a turning point that shaped their morals) and a current goal, with correct names, pronouns and grammatical agreement. Two characters with the same race, class, alignment and gender rarely get the same story.

**Why this priority**: Today most characters get the same generic text; content quality is the core of the product without AI.

**Independent Test**: Generate 100 characters for one fixed combination (e.g. female Orc Cleric, Chaotic Good) in each language: at least 60 distinct backgrounds, all mentioning the character's name, with pronouns and agreements matching the gender.

**Acceptance Scenarios**:

1. **Given** any race, class, alignment and gender, **When** a character is generated, **Then** the background has a title and 4 paragraphs: origin (matching the race), training (matching the class), turning point (matching the alignment) and current goal.
2. **Given** a male, female or non-binary character, **When** the background is shown in English, **Then** it uses he/his, she/her or they/their respectively, consistently.
3. **Given** a character shown in French, **When** the background is read, **Then** pronouns, articles and adjectives agree with the character's gender; for a non-binary character the text uses neutral phrasing with no gendered pronoun or agreement.
4. **Given** a rerolled race, **When** the background is regenerated, **Then** only the origin paragraph changes to match the new race; the other paragraphs are kept.
5. **Given** the same character, **When** the language is switched, **Then** the background is the same story in the other language (same fragments, translated), not a new random one.

---

### User Story 3 - Names that fit the race and gender (Priority: P2)

A user generates characters and gets names that sound right: orcish names for orcs, elvish names for elves, dwarvish names for dwarves, varied names for humans. Non-binary characters get first names chosen from a gender-neutral list. Epithets are translated and, in French, agree with the gender ("le Hardi", "la Hardie").

**Why this priority**: Names are the first thing users read; a mismatch ("Sophie" the orc) breaks immersion, but the app stays usable without it.

**Independent Test**: Generate 50 characters per race: every first and last name comes from that race's lists; non-binary characters only get gender-neutral first names; each French epithet matches the gender.

**Acceptance Scenarios**:

1. **Given** an Orc, **When** a name is generated, **Then** first and last names come from the orcish lists for that gender.
2. **Given** a non-binary character of any race, **When** a first name is generated, **Then** it comes from that race's gender-neutral list.
3. **Given** the first name is rerolled, **When** the gender is unchanged, **Then** the new first name fits the same race and gender.
4. **Given** a female character with the epithet "The Bold", **When** shown in French, **Then** the epithet reads "la Hardie"; for a male character, "le Hardi".
5. **Given** each race and gender, **When** the name lists are counted, **Then** there are at least 40 first names per race and gender (including gender-neutral) and 40 last names per race.

---

### User Story 4 - AI-written text in the user's language (Priority: P2)

A user with an AI provider enabled generates a character in French. The AI writes the names, epithet and background in French. If they later switch to English, the AI-written text stays as written (it is not regenerated) and a small label shows it was written in French by the AI; app-generated parts (race, class, alignment) switch to English.

**Why this priority**: Keeps the AI feature consistent with the bilingual app without paying for re-generation.

**Independent Test**: With a fake provider, generate in French and check the prompt asks for French; switch to English and check the background is unchanged and labelled "Written by AI in French".

**Acceptance Scenarios**:

1. **Given** the app in French and an AI provider, **When** a character is generated, **Then** the AI is asked to write in French.
2. **Given** an AI-written background in French, **When** the user switches to English, **Then** the background text is unchanged and labelled with its language and its AI origin.
3. **Given** an AI-written text in another language and a configured AI provider, **When** the user chooses "Translate with AI", **Then** the name-independent texts (epithet and background) are rewritten in the current language, keeping the same story, and the label shows the new language.
4. **Given** no AI provider configured, **When** an AI-written text is in another language, **Then** no translate action is offered.
5. **Given** an AI failure, **When** the app falls back to its own content, **Then** that content is in the current language and switches with it.

---

### User Story 5 - Saved and older characters keep working (Priority: P3)

A user who saved characters before this feature opens "My Characters". Old characters still display. Characters created after this feature, from app content, display in the current language.

**Why this priority**: Avoids breaking existing data; low effort but necessary.

**Independent Test**: Load saved data from the previous version; every old character displays; new app-made characters switch language with the app.

**Acceptance Scenarios**:

1. **Given** characters saved by a previous version, **When** "My Characters" opens, **Then** they display unchanged, labelled as written in English.
2. **Given** a saved app-made character, **When** the language is switched, **Then** its race, class, alignment, epithet and background display in the new language.

---

### Edge Cases

- The browser prefers a regional variant ("fr-CA", "en-GB"): it maps to French or English.
- The browser prefers a language other than English or French: English is used.
- The stored language preference is invalid: it is ignored and the browser language is used.
- A fragment is missing in one language for a combination: the app uses another fragment of the same category in that language rather than mixing languages; a data test prevents shipping missing translations.
- A name or epithet has no French form: the data test fails; the app never shows a placeholder.
- A character's gender is rerolled: names stay unless they no longer fit (a first name outside the new gender's list is rerolled too), pronouns and agreements update everywhere.
- Very long names or titles in French: layouts wrap without overflowing on phones.
- Saved data mixing old (text) and new (fragment) characters: both display.

## Requirements _(mandatory)_

### Functional Requirements

**Languages**

- **FR-001**: Every text of the interface (navigation, page titles, buttons, labels, helper texts, alerts, error messages, empty states, settings) MUST exist in English and French.
- **FR-002**: On a first visit the language MUST follow the browser preference: French for any French variant, English otherwise.
- **FR-003**: Users MUST be able to switch language from a selector reachable from every page; the switch MUST apply immediately without reload and be remembered on this device.
- **FR-004**: The page language MUST be declared for assistive technologies and match the displayed language.
- **FR-005**: Race, class, gender and alignment names MUST be displayed in the current language, with French gender agreement.

**Content**

- **FR-006**: A background generated by the app MUST be composed of a title and four paragraphs: an origin chosen for the race, a training chosen for the class, a turning point chosen for the alignment, and a current goal (any character).
- **FR-007**: Fragments MUST use placeholders for names, epithet and pronouns, and MUST support French grammatical agreement by gender; no fragment is written once per gender. In French, the non-binary form of a fragment MUST use neutral phrasing (no gendered pronoun, article or agreement, no neopronoun or inclusive punctuation).
- **FR-008**: Each fragment MUST exist in both languages under the same identity, so a background can be shown in either language.
- **FR-009**: The content MUST include at least 4 origins per race, 4 trainings per class, 3 turning points per alignment and 10 current goals, plus at least 6 title patterns.
- **FR-010**: First names MUST be chosen from the character's race and gender lists, with a gender-neutral list for non-binary characters; last names from the race's list.
- **FR-011**: Epithets MUST exist in both languages, with masculine and feminine French forms and a neutral French form for non-binary characters (e.g. an epithet without gendered article or adjective agreement).
- **FR-012**: When one property is rerolled, only the fragments that depend on it MUST change (race → origin, class → training, alignment → turning point); names and epithet are untouched except as stated in edge cases.
- **FR-012a**: The previous hand-written full backgrounds MUST no longer be used as a content source; generation relies on fragments only.
- **FR-013**: A data check MUST fail when any fragment, name list, epithet or label is missing in a language, uses an unknown placeholder, or a combination has fewer fragments than FR-009.

**AI and stored characters**

- **FR-014**: When an AI provider is used, it MUST be asked to write in the current language.
- **FR-015**: Text written by the AI MUST be stored with its language and displayed as written in any interface language, with a visible label stating it was written by the AI and in which language.
- **FR-015a**: When AI-written text is in another language than the interface and an AI provider is configured, users MUST be offered a "Translate with AI" action that rewrites the epithet and background in the current language without changing the story; on failure the original text is kept and the usual failure message is shown. The app never translates automatically.
- **FR-016**: App-made characters MUST be stored in a language-independent way (fragment and list references) so they re-render in the current language; characters saved by previous versions MUST still display, as English text.

### Key Entities

- **Locale**: "en" or "fr"; the user's choice, stored on the device.
- **Fragment**: a piece of background with an identity, a category (title, origin, training, turning point, goal), the race/class/alignment it applies to (if any), and its text in each language with placeholders and gender forms.
- **Name lists**: per race, first names by gender (male, female, neutral) and last names; names are the same in both languages.
- **Epithet**: an identity with its English text and French masculine, feminine and non-binary forms.
- **Character content**: either references (fragment ids, epithet id) rendered in the current language, or written text with its language and origin (AI or legacy).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: With the interface in French, a review of every page and alert finds 0 English texts (and vice versa), excluding character names.
- **SC-002**: For any fixed race, class, alignment and gender, 100 generations produce at least 60 distinct backgrounds in each language.
- **SC-003**: Across 200 generated characters per language, a review of 20 random backgrounds finds 0 pronoun or agreement errors.
- **SC-004**: 100% of generated first and last names belong to the character's race lists, and 100% of non-binary first names to the neutral lists.
- **SC-005**: Switching language updates the whole screen in under half a second, without reloading.
- **SC-006**: 100% of characters saved by the previous version still display after the update.

## Assumptions

- Character names are not translated; only labels, epithets and backgrounds are.
- The 46 existing hand-written backgrounds are removed from the app; their best passages are recycled as fragments, rewritten for gender placeholders and translated.
- Content is written for this feature (by the maintainer with AI assistance) in a classic heroic fantasy tone; quantities in FR-009 are minimums.
- French text refers to non-binary characters with neutral phrasing that avoids gendered words (the name, "cette personne", participles, epithets without article agreement…), never with a neopronoun or inclusive punctuation.
- Portraits keep their current behaviour (out of scope).
- Only English and French; adding a language later needs only data (constitution II).
