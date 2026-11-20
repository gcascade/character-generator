import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import React, { FC, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ShareButton from '../../components/common/share/ShareButton';
import NpcSheet from '../../components/npc/npcSheet/NpcSheet';
import { shareUrl } from '../../content/share';
import useAlert from '../../hooks/useAlert';
import useNpcs from '../../hooks/useNpcs';
import { useT } from '../../i18n';

const BACK = { pathname: '/characters' };
const BACK_STATE = { tab: 'npcs' };

/** A saved side character on its own page, `/npcs/:id` (spec 010). */
const NpcDetails: FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const { savedNpcs, deleteNpc, setNpc } = useNpcs();
  const { addSuccess } = useAlert();
  const [confirming, setConfirming] = useState(false);
  const npc = savedNpcs.find((saved) => saved.id === id);

  if (!npc) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {t('npc.notFound')}
        </Typography>
        <MuiLink component={Link} to={BACK} state={BACK_STATE}>
          {t('npc.back')}
        </MuiLink>
      </Container>
    );
  }

  const remove = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    deleteNpc(npc.id!);
    addSuccess(t('npc.removedAlert'));
    navigate(BACK, { state: BACK_STATE });
  };

  return (
    <Box sx={{ padding: { xs: 0.5, sm: 2 }, maxWidth: 1100, mx: 'auto' }}>
      <Button
        component={Link}
        to={BACK}
        state={BACK_STATE}
        startIcon={<BackIcon />}
        sx={{ mb: 1 }}
      >
        {t('npc.back')}
      </Button>
      <NpcSheet
        npc={npc}
        headingLevel="h1"
        footer={
          <>
            <Button
              variant="contained"
              onClick={() => {
                setNpc(npc);
                navigate('/npcs');
              }}
            >
              {t('share.openNpc')}
            </Button>
            <ShareButton
              label={t('npc.share')}
              target={() => ({
                title: `${npc.firstName} ${npc.lastName}`,
                url: shareUrl({ kind: 'npc', npc }),
                copied: 'share.npcCopied',
              })}
            />
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={remove}
              onBlur={() => setConfirming(false)}
            >
              {t(confirming ? 'character.confirmDelete' : 'npc.delete')}
            </Button>
          </>
        }
      />
    </Box>
  );
};

export default NpcDetails;
