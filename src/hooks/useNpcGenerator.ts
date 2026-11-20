import { useCallback, useEffect, useRef, useState } from 'react';
import { isCallerAbort } from '../ai/errors';
import { outcomeToAlert, providerContext } from '../ai/messages';
import { generateNpcSheet } from '../ai/npc';
import { createProvider } from '../ai/providers';
import { useLocale, useT } from '../i18n';
import useAlert from './useAlert';
import useNpcs from './useNpcs';
import useSettings from './useSettings';

/**
 * Generates a side character with the app's content right away; with an AI
 * provider, the AI then writes the name and sheet (spec 010 US4).
 */
const useNpcGenerator = () => {
  const { generate, setNpc } = useNpcs();
  const { settings, keys } = useSettings();
  const { addSuccess, addInfo, addWarning, addError } = useAlert();
  const t = useT();
  const { locale } = useLocale();
  const [writing, setWriting] = useState(false);
  const controller = useRef<AbortController | null>(null);

  // A sheet arriving after the page is gone must not change anything.
  useEffect(() => () => controller.current?.abort(), []);

  const generateNpc = useCallback(async () => {
    controller.current?.abort();
    const npc = generate();
    const provider = createProvider(settings, keys);
    if (!provider) return;
    const current = new AbortController();
    controller.current = current;
    setWriting(true);
    try {
      const outcome = await generateNpcSheet(
        provider,
        npc,
        locale,
        current.signal,
      );
      if (current.signal.aborted) return;
      setNpc(outcome.npc);
      const alert = outcomeToAlert(
        outcome,
        'npc',
        providerContext(settings),
        t,
      );
      ({
        success: addSuccess,
        info: addInfo,
        warning: addWarning,
        error: addError,
      })[alert.severity](alert.message);
    } catch (error) {
      if (isCallerAbort(error)) return;
      console.error('Side character sheet failed', error);
      addError(t('ai.unexpected'));
    } finally {
      if (!current.signal.aborted) setWriting(false);
    }
  }, [
    generate,
    setNpc,
    settings,
    keys,
    locale,
    t,
    addSuccess,
    addInfo,
    addWarning,
    addError,
  ]);

  return { generateNpc, writing };
};

export default useNpcGenerator;
