import {
  Brush as PaintIcon,
  Close as CancelIcon,
  HideImage as RemoveIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Typography,
} from '@mui/material';
import React, { FC, useContext, useState } from 'react';
import { PortraitContext } from '../../../contexts/PortraitContext';
import {
  buildPortraitPrompt,
  type PortraitSubject,
  randomVariety,
} from '../../../content/portraitPrompt';
import useAlert from '../../../hooks/useAlert';
import usePortraitPainter from '../../../hooks/usePortraitPainter';
import usePortraits from '../../../hooks/usePortraits';
import { useT } from '../../../i18n';

/** Remembered once the user has read the privacy notice (FR-008). */
export const NOTICE_KEY = 'portraitNotice';

const noticeSeen = () => {
  try {
    return localStorage.getItem(NOTICE_KEY) === 'seen';
  } catch {
    return false;
  }
};

type PaintPortraitProps = {
  subject: PortraitSubject;
  /** The painted portrait currently shown, if any. */
  portraitId?: string;
  onPainted: (id: string) => void;
  onRemoved: VoidFunction;
};

/** "Paint a portrait": privacy notice, queue progress, cancel, repaint and remove (spec 011 US1). */
const Painter: FC<PaintPortraitProps> = ({
  subject,
  portraitId,
  onPainted,
  onRemoved,
}) => {
  const t = useT();
  const { addSuccess } = useAlert();
  const { remove, persisted, get } = usePortraits();
  const { state, paint, cancel } = usePortraitPainter();
  const [asking, setAsking] = useState(false);
  const [dontAsk, setDontAsk] = useState(false);
  const painted = !!get(portraitId);

  const duration = (seconds: number) =>
    seconds >= 90
      ? t('portrait.minutes', { count: Math.round(seconds / 60) })
      : t('portrait.seconds', { count: Math.max(5, Math.round(seconds)) });

  // Each painting draws a new light and expression (and a pose for adventurers); the notice shows the exact
  // description sent.
  const adventurer = !!subject.characterClass;
  const [variety, setVariety] = useState(() => randomVariety(adventurer));
  const posed = { ...subject, ...variety };
  const start = () => {
    void paint(posed, onPainted);
    setVariety(randomVariety(adventurer));
  };
  const onPaint = () => (noticeSeen() ? start() : setAsking(true));

  if (state.status !== 'idle') {
    return (
      <Box sx={{ width: '100%' }} role="status" aria-live="polite">
        <LinearProgress
          aria-label={t('portrait.paint')}
          sx={{ mb: 1, borderRadius: 1 }}
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {state.status === 'submitting'
              ? t('portrait.submitting')
              : state.queuePosition > 0
                ? t('portrait.queued', {
                    position: state.queuePosition,
                    wait: duration(state.waitSeconds),
                  })
                : t('portrait.painting', { wait: duration(state.waitSeconds) })}
          </Typography>
          <Button size="small" startIcon={<CancelIcon />} onClick={cancel}>
            {t('portrait.cancel')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Button size="small" startIcon={<PaintIcon />} onClick={onPaint}>
          {t(painted ? 'portrait.repaint' : 'portrait.paint')}
        </Button>
        {painted && (
          <Button
            size="small"
            startIcon={<RemoveIcon />}
            onClick={() => {
              remove(portraitId!);
              onRemoved();
              addSuccess(t('portrait.removed'));
            }}
          >
            {t('portrait.remove')}
          </Button>
        )}
      </Box>
      {painted && !persisted && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {t('portrait.sessionOnly')}
        </Alert>
      )}
      <Dialog open={asking} onClose={() => setAsking(false)} maxWidth="sm">
        <DialogTitle>{t('portrait.notice.title')}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{t('portrait.notice.body')}</Typography>
          <Typography
            sx={{
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mt: 2,
            }}
          >
            {t('portrait.notice.description')}
          </Typography>
          <Typography
            component="blockquote"
            sx={{ m: 0, mt: 0.5, fontStyle: 'italic' }}
          >
            {buildPortraitPrompt(posed).positive}
          </Typography>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={dontAsk}
                onChange={(event) => setDontAsk(event.target.checked)}
              />
            }
            label={t('portrait.notice.dontAsk')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAsking(false)}>
            {t('portrait.notice.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (dontAsk) {
                try {
                  localStorage.setItem(NOTICE_KEY, 'seen');
                } catch {
                  // Not remembered: the notice shows again next time.
                }
              }
              setAsking(false);
              start();
            }}
          >
            {t('portrait.notice.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/** Offered only where portraits can be kept (a PortraitProvider above); nothing otherwise. */
const PaintPortrait: FC<PaintPortraitProps> = (props) =>
  useContext(PortraitContext) ? <Painter {...props} /> : null;

export default PaintPortrait;
