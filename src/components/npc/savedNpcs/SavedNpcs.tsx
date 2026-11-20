import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import useNpcs from '../../../hooks/useNpcs';
import { useT } from '../../../i18n';
import NpcCard from '../npcCard/NpcCard';

/** Saved side characters, in the "My characters" tab (spec 010). */
const SavedNpcs: FC = () => {
  const t = useT();
  const { savedNpcs } = useNpcs();

  if (!savedNpcs.length) {
    return (
      <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        {t('npcs.empty')}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 2,
        maxWidth: 1400,
        mx: 'auto',
      }}
    >
      {savedNpcs.map((npc) => (
        <NpcCard key={npc.id} npc={npc} to={`/npcs/${npc.id}`} />
      ))}
    </Box>
  );
};

export default SavedNpcs;
