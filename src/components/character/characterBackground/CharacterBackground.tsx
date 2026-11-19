import { MenuBook as MenuBookIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React, { FC, useContext, useRef, useState } from 'react';
import { renderCharacter } from '../../../content/character';
import { label } from '../../../content/labels';
import { CharacterContext } from '../../../contexts/CharacterContext';
import { useLocale, useT } from '../../../i18n';
import StoryDialog, { storyParagraphSx } from '../storyDialog/StoryDialog';
import WrittenInNotice from '../writtenInNotice/WrittenInNotice';

type CharacterBackgroundProps = {
  /** Rewrites AI-written text in the interface language; offered when an AI provider is configured. */
  onTranslate?: VoidFunction;
  translating?: boolean;
};

/**
 * The story of the current character (spec 005 US3): its title and first
 * paragraph with a drop cap; the whole story opens in a reading view.
 */
const CharacterBackground: FC<CharacterBackgroundProps> = ({
  onTranslate,
  translating,
}) => {
  const [reading, setReading] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const t = useT();
  const { locale } = useLocale();
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'CharacterBackground must be used within a CharacterProvider',
    );
  }
  const { character } = context;
  const rendered = renderCharacter(character, locale);
  const { title, content } = rendered.background;
  const { race, characterClass, gender, alignment } = character;
  const raceLabel = label('race', race, gender, locale);
  const subtitle = `${t('character.subtitle', {
    race: locale === 'fr' ? raceLabel.toLowerCase() : raceLabel,
    characterClass: label('class', characterClass, gender, locale),
  })} · ${label('alignment', alignment, gender, locale)}`;

  return (
    <Box
      component="section"
      aria-labelledby="character-story-title"
      sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}
    >
      <Typography
        id="character-story-title"
        variant="h4"
        component="h3"
        sx={{ color: 'primary.main', mb: 1 }}
      >
        {title}
      </Typography>
      {rendered.writtenIn && (
        <WrittenInNotice
          language={rendered.writtenIn}
          by={rendered.writtenBy ?? 'legacy'}
          onTranslate={rendered.writtenBy === 'ai' ? onTranslate : undefined}
          translating={translating}
        />
      )}
      {content.length > 0 && (
        <Typography variant="story" sx={storyParagraphSx(true)}>
          {content[0]}
        </Typography>
      )}
      {content.length > 1 && (
        <Button
          ref={opener}
          startIcon={<MenuBookIcon />}
          onClick={() => setReading(true)}
          sx={{ textTransform: 'none', fontSize: '1rem', px: 0.5 }}
        >
          {t('story.read')}
        </Button>
      )}
      <StoryDialog
        open={reading}
        onClose={() => setReading(false)}
        title={title}
        subtitle={subtitle}
        paragraphs={content}
      />
    </Box>
  );
};

export default CharacterBackground;
