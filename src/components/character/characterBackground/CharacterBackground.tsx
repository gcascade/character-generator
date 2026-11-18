import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { FC, useContext, useMemo, useState } from 'react';
import { CharacterContext } from '../../../contexts/CharacterContext';
import CharacterTypography from '../characterTypography/CharacterTypography';
import './CharacterBackground.css';
import { useLocale, useT } from '../../../i18n';
import { renderCharacter } from '../../../content/character';
import WrittenInNotice from '../writtenInNotice/WrittenInNotice';

const MAX_LENGTH = 500;

type CharacterBackgroundProps = {
  /** Rewrites AI-written text in the interface language; offered when an AI provider is configured. */
  onTranslate?: VoidFunction;
  translating?: boolean;
};

const CharacterBackground: FC<CharacterBackgroundProps> = ({
  onTranslate,
  translating,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useT();
  const { locale } = useLocale();
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'CharacterBackground must be used within a CharacterProvider',
    );
  }
  const rendered = renderCharacter(context.character, locale);
  const { background } = rendered;
  const { content, title } = background;

  const processedContent = useMemo(() => {
    if (!content) {
      return null;
    }
    let charactersLeft = MAX_LENGTH;
    return content
      .map((paragraph) => {
        if (isExpanded) {
          return paragraph;
        }
        if (charactersLeft <= 0) {
          return null;
        }
        if (paragraph.length <= charactersLeft) {
          charactersLeft -= paragraph.length;
          return paragraph;
        }
        const truncated = `${paragraph.substring(0, charactersLeft)}... `;
        charactersLeft = 0;
        return truncated;
      })
      .filter(Boolean);
  }, [content, isExpanded]);

  const toggleIsExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!background) {
    return;
  }

  function simpleHash(str: string | null | undefined) {
    if (!str) {
      return 0;
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  return (
    <>
      <CharacterTypography>
        <strong>{t('character.history')}</strong>
      </CharacterTypography>
      <Typography variant="h5" className="background-title">
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
      {processedContent?.map((paragraph) => (
        <div
          key={`content-${simpleHash(paragraph)}`}
          style={{ padding: '5px' }}
        >
          <CharacterTypography>{paragraph}</CharacterTypography>
        </div>
      ))}
      <Button
        onClick={toggleIsExpanded}
        variant="text"
        size="small"
        style={{
          color: theme.palette.text.primary,
          fontSize: theme.typography.body1.fontSize,
          fontFamily: theme.typography.fontFamily,
          textTransform: 'none',
        }}
      >
        {isExpanded ? t('character.showLess') : t('character.showMore')}
      </Button>
    </>
  );
};

export default CharacterBackground;
