import { useCallback, useState } from 'react';
import { type MessageKey, useT } from '../i18n';
import useAlert from './useAlert';

export type ShareTarget = { title: string; url: string; copied: MessageKey };

/**
 * Shares a link (spec 007 R5): the device share sheet when there is one, the
 * clipboard otherwise, and as a last resort a dialog showing the link.
 */
const useShare = () => {
  const t = useT();
  const { addSuccess } = useAlert();
  const [fallbackUrl, setFallbackUrl] = useState<string>();

  const share = useCallback(
    async ({ title, url, copied }: ShareTarget) => {
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, url });
          return;
        } catch (error) {
          // The user closed the share sheet: nothing to do.
          if ((error as { name?: string })?.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        addSuccess(t(copied));
      } catch {
        setFallbackUrl(url);
      }
    },
    [addSuccess, t],
  );

  return {
    share,
    fallbackUrl,
    closeFallback: () => setFallbackUrl(undefined),
  };
};

export default useShare;
