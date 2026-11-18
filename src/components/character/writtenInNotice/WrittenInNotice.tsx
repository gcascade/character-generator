import { Translate as TranslateIcon } from '@mui/icons-material';
import { Box, Button, Chip } from '@mui/material';
import React, { FC } from 'react';
import { type Locale, useT } from '../../../i18n';

type WrittenInNoticeProps = {
  /** Language the text was written in. */
  language: Locale;
  by: 'ai' | 'legacy';
  /** Offered only when an AI provider is configured (spec 002 FR-015a). */
  onTranslate?: VoidFunction;
  translating?: boolean;
};

/** Tells that a text is shown in another language than the interface, and by whom it was written. */
const WrittenInNotice: FC<WrittenInNoticeProps> = ({
  language,
  by,
  onTranslate,
  translating = false,
}) => {
  const t = useT();
  const languageName = t(`language.inline.${language}`);
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        my: 1,
      }}
    >
      <Chip
        size="small"
        variant="outlined"
        label={t(
          by === 'ai' ? 'character.writtenByAi' : 'character.writtenIn',
          {
            language: languageName,
          },
        )}
      />
      {onTranslate && (
        <Button
          size="small"
          startIcon={<TranslateIcon />}
          onClick={onTranslate}
          disabled={translating}
        >
          {t('character.translate')}
        </Button>
      )}
    </Box>
  );
};

export default WrittenInNotice;
