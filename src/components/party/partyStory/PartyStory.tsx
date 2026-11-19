import { Box, Card, CardContent, Typography } from '@mui/material';
import React, { FC } from 'react';
import { renderParty } from '../../../content/party';
import { useLocale, useT } from '../../../i18n';
import type { Party } from '../../../types/party';
import { storyParagraphSx } from '../../character/storyDialog/StoryDialog';
import WrittenInNotice from '../../character/writtenInNotice/WrittenInNotice';

type PartyStoryProps = { party: Party };

/** The party's name and how the company came together (spec 004 FR-009). */
const PartyStory: FC<PartyStoryProps> = ({ party }) => {
  const t = useT();
  const { locale } = useLocale();
  const { name, story, writtenIn, writtenBy } = renderParty(party, locale);

  return (
    <Card component="section" aria-labelledby="party-name">
      <CardContent sx={{ px: { xs: 2, sm: 4 }, py: { xs: 2, sm: 3 } }}>
        <Typography
          sx={{
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            textAlign: 'center',
          }}
        >
          {t('party.story')}
        </Typography>
        <Typography
          id="party-name"
          variant="h3"
          component="h2"
          sx={{ color: 'primary.main', textAlign: 'center', mb: 2 }}
        >
          {name}
        </Typography>
        {writtenIn && writtenBy && (
          <WrittenInNotice language={writtenIn} by={writtenBy} />
        )}
        <Box sx={{ maxWidth: '70ch', mx: 'auto' }}>
          {story.map((paragraph, index) => (
            <Typography
              key={index}
              variant="story"
              component="p"
              sx={storyParagraphSx(index === 0)}
            >
              {paragraph}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PartyStory;
