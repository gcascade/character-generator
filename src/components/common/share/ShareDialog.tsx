import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { FC, useRef } from 'react';
import { useT } from '../../../i18n';

type ShareDialogProps = { url?: string; onClose: VoidFunction };

/** Shows a share link to copy by hand, when the clipboard is not available. */
const ShareDialog: FC<ShareDialogProps> = ({ url, onClose }) => {
  const t = useT();
  const field = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={!!url} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('share.dialogTitle')}</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={field}
          value={url ?? ''}
          fullWidth
          autoFocus
          onFocus={(event) => event.target.select()}
          slotProps={{
            htmlInput: { readOnly: true, 'aria-label': t('share.dialogTitle') },
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            field.current?.select();
            document.execCommand?.('copy');
          }}
        >
          {t('share.copy')}
        </Button>
        <Button onClick={onClose}>{t('story.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
