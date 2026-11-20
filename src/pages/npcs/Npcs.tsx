import {
  BookmarkAdded as SavedIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React, { FC, useRef } from 'react';
import PageTitle from '../../components/common/pageTitle/PageTitle';
import ShareButton from '../../components/common/share/ShareButton';
import NpcCard from '../../components/npc/npcCard/NpcCard';
import NpcControls from '../../components/npc/npcControls/NpcControls';
import NpcSheet from '../../components/npc/npcSheet/NpcSheet';
import { shareUrl } from '../../content/share';
import useAlert from '../../hooks/useAlert';
import useNpcGenerator from '../../hooks/useNpcGenerator';
import useNpcs from '../../hooks/useNpcs';
import { useT } from '../../i18n';

/** The side-character page (spec 010): one sheet, and five quick faces on demand. */
const Npcs: FC = () => {
  const t = useT();
  const { addSuccess, addInfo } = useAlert();
  const {
    npc,
    batch,
    locked,
    generateBatch,
    openFromBatch,
    reroll,
    toggleLock,
    saveNpc,
    isSaved,
  } = useNpcs();
  const { generateNpc, writing } = useNpcGenerator();
  const sheet = useRef<HTMLDivElement>(null);

  const save = (target = npc) => {
    saveNpc(target);
    addSuccess(t('npc.savedAlert'));
  };

  return (
    <Box sx={{ padding: { xs: 0.5, sm: 2 }, maxWidth: 1400, mx: 'auto' }}>
      <PageTitle gutterBottom={false}>{t('page.npcs')}</PageTitle>
      <Typography
        align="center"
        sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 0.5, mb: 3 }}
      >
        {t('npcs.subtitle')}
      </Typography>
      <NpcControls
        onGenerate={() => void generateNpc()}
        onGenerateBatch={generateBatch}
        generating={writing}
      />
      <Box ref={sheet} sx={{ mt: 3, scrollMarginTop: 80 }}>
        <NpcSheet
          npc={npc}
          actions={{
            onReroll: (target) => {
              if (!reroll(target)) addInfo(t('reroll.nothingElseFits'));
            },
            isLocked: (property) => locked.includes(property),
            onToggleLock: toggleLock,
            disabled: writing,
          }}
          footer={
            <>
              <Button
                variant="contained"
                startIcon={isSaved(npc) ? <SavedIcon /> : <SaveIcon />}
                disabled={isSaved(npc)}
                onClick={() => save()}
              >
                {t(isSaved(npc) ? 'npc.saved' : 'npc.save')}
              </Button>
              <ShareButton
                label={t('npc.share')}
                target={() => ({
                  title: `${npc.firstName} ${npc.lastName}`,
                  url: shareUrl({ kind: 'npc', npc }),
                  copied: 'share.npcCopied',
                })}
              />
            </>
          }
        />
      </Box>
      {batch.length > 0 && (
        <Box component="section" aria-labelledby="npc-batch" sx={{ mt: 4 }}>
          <Typography id="npc-batch" variant="h4" component="h2" sx={{ mb: 2 }}>
            {t('npc.batch')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {batch.map((card, index) => (
              <NpcCard
                key={`${index}-${card.firstName}`}
                npc={card}
                saved={isSaved(card)}
                onOpen={() => {
                  openFromBatch(index);
                  sheet.current?.scrollIntoView?.({ behavior: 'smooth' });
                }}
                onSave={() => save(card)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Npcs;
