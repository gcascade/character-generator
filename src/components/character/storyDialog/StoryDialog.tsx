import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { FC } from 'react';
import { useT } from '../../../i18n';
import { DISPLAY_FONT } from '../../../themes/themes';

/** A story paragraph; the first one opens with a drop cap (spec 005 US3). */
export const storyParagraphSx = (dropCap: boolean) => ({
  mb: 1.75,
  maxWidth: '66ch',
  ...(dropCap && {
    '&::first-letter': {
      float: 'left',
      fontFamily: DISPLAY_FONT,
      fontWeight: 700,
      fontSize: '3.6em',
      lineHeight: 0.85,
      color: 'secondary.main',
      pt: 0.75,
      pr: 1,
    },
  }),
});

type StoryDialogProps = {
  open: boolean;
  onClose: VoidFunction;
  title: string;
  subtitle?: string;
  paragraphs: string[];
};

/** Reading view of a character's story; full screen on phones. */
const StoryDialog: FC<StoryDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  paragraphs,
}) => {
  const t = useT();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      aria-labelledby="story-dialog-title"
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 40px',
          alignItems: 'start',
          px: { xs: 1.5, sm: 3 },
          pt: { xs: 1.5, sm: 3 },
        }}
      >
        <span />
        <Box sx={{ textAlign: 'center', minWidth: 0 }}>
          <Typography
            id="story-dialog-title"
            variant="h3"
            component="h2"
            sx={{ color: 'primary.main', overflowWrap: 'anywhere' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="story"
              component="p"
              sx={{ fontStyle: 'italic', color: 'text.secondary' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton aria-label={t('story.close')} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ px: { xs: 2.5, sm: 5 }, pb: 4 }}>
        {paragraphs.map((paragraph, index) => (
          <Typography
            key={index}
            variant="story"
            component="p"
            sx={{ ...storyParagraphSx(index === 0), fontSize: '1.2rem' }}
          >
            {paragraph}
          </Typography>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default StoryDialog;
