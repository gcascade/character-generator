import { Casino as RerollIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import React, { FC } from 'react';
import { renderHook } from '../../../content/partyDepth';
import { useLocale, useT } from '../../../i18n';
import type { Party } from '../../../types/party';
import { storyParagraphSx } from '../../character/storyDialog/StoryDialog';
import WrittenInNotice from '../../character/writtenInNotice/WrittenInNotice';

type AdventureHookProps = { party: Party; onReroll?: VoidFunction };

/** Where the adventure begins (spec 008 US4). */
const AdventureHook: FC<AdventureHookProps> = ({ party, onReroll }) => {
  const t = useT();
  const { locale } = useLocale();
  const text = renderHook(party, locale);
  if (!text) return null;
  const aiLanguage = party.text?.hook ? party.text.language : undefined;

  return (
    <Card component="section" aria-labelledby="party-hook-title">
      <CardContent sx={{ px: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography id="party-hook-title" variant="h5" component="h3">
            {t('party.hook')}
          </Typography>
          {onReroll && (
            <Button size="small" startIcon={<RerollIcon />} onClick={onReroll}>
              {t('party.hook.reroll')}
            </Button>
          )}
        </Box>
        {aiLanguage && aiLanguage !== locale && (
          <WrittenInNotice language={aiLanguage} by="ai" />
        )}
        <Typography
          variant="story"
          component="p"
          sx={{ ...storyParagraphSx(true), mt: 1, mb: 0 }}
        >
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AdventureHook;
