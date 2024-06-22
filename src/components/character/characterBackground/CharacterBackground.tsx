import { Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { FC, useContext, useMemo, useState } from 'react';
import { CharacterContext } from '../../../contexts/CharacterContext';
import CharacterTypography from '../characterTypography/CharacterTypography';
import './CharacterBackground.css';

const MAX_LENGTH = 500;

const CharacterBackground: FC = () => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'CharacterBackground must be used within a CharacterProvider',
    );
  }
  const {
    character: {
      background,
      background: { content, title },
    },
  } = context;

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
        <strong>History:</strong>
      </CharacterTypography>
      <Typography variant="h5" className="background-title">
        {title}
      </Typography>
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
        {isExpanded ? 'Show Less' : 'Show More...'}
      </Button>
    </>
  );
};

export default CharacterBackground;
