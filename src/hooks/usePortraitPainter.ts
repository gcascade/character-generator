import { useCallback, useEffect, useRef, useState } from 'react';
import { PortraitError, type PaintProgress, paintWithHorde } from '../ai/horde';
import {
  buildPortraitPrompt,
  type PortraitSubject,
  traitsOf,
} from '../content/portraitPrompt';
import { shrinkImage } from '../content/storedPortraits';
import { type MessageKey, useT } from '../i18n';
import useAlert from './useAlert';
import usePortraits from './usePortraits';

export type PaintingState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | ({ status: 'queued' } & PaintProgress);

/**
 * Paints one portrait at a time for a character or side character (spec 011
 * US1): progress, cancel, messages; the result is stored and its id handed to
 * `onPainted`. Leaving the page cancels the painting.
 */
const usePortraitPainter = () => {
  const t = useT();
  const { addSuccess, addInfo, addWarning } = useAlert();
  const { add } = usePortraits();
  const [state, setState] = useState<PaintingState>({ status: 'idle' });
  const controller = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      // Leaving the page: cancel silently.
      const current = controller.current;
      controller.current = null;
      current?.abort();
    },
    [],
  );

  const paint = useCallback(
    async (subject: PortraitSubject, onPainted: (id: string) => void) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setState({ status: 'submitting' });
      try {
        const image = await paintWithHorde(buildPortraitPrompt(subject), {
          signal: current.signal,
          onProgress: (progress) => setState({ status: 'queued', ...progress }),
        });
        const small = await shrinkImage(image).catch(() => {
          throw new PortraitError('invalid-answer', 'storage');
        });
        if (current.signal.aborted) return;
        onPainted(add(small, traitsOf(subject)));
        addSuccess(t('portrait.done'));
      } catch (error) {
        if (current.signal.aborted) {
          // Cancelled by the user (not by leaving the page): say so.
          if (controller.current === current) addInfo(t('portrait.cancelled'));
          return;
        }
        if (error instanceof PortraitError) {
          addWarning(
            error.message === 'storage'
              ? t('portrait.error.storage')
              : t(`portrait.error.${error.reason}` as MessageKey, {
                  detail: error.message,
                }),
          );
        } else {
          console.error('Portrait painting failed', error);
          addWarning(t('portrait.error.unreachable'));
        }
      } finally {
        if (controller.current === current) {
          controller.current = null;
          setState({ status: 'idle' });
        }
      }
    },
    [add, addInfo, addSuccess, addWarning, t],
  );

  const cancel = useCallback(() => {
    const current = controller.current;
    current?.abort(new DOMException('Cancelled', 'AbortError'));
  }, []);

  return { state, paint, cancel };
};

export default usePortraitPainter;
