import { useCallback, useEffect, useRef, useState } from 'react';
import { isCallerAbort } from '../ai/errors';
import { outcomeToAlert, providerContext } from '../ai/messages';
import { generatePartyStory } from '../ai/party';
import { createProvider } from '../ai/providers';
import { useLocale, useT } from '../i18n';
import useAlert from './useAlert';
import useParty from './useParty';
import useSettings from './useSettings';

/**
 * Generates a party with the app's content right away; with an AI provider,
 * the AI then writes the party's name and story (spec 004 US4).
 */
const usePartyGenerator = () => {
  const { generate, setParty } = useParty();
  const { settings, keys } = useSettings();
  const { addSuccess, addInfo, addWarning, addError } = useAlert();
  const t = useT();
  const { locale } = useLocale();
  const [writing, setWriting] = useState(false);
  const controller = useRef<AbortController | null>(null);

  // A story arriving after the page is gone must not change anything.
  useEffect(() => () => controller.current?.abort(), []);

  const generateParty = useCallback(async () => {
    controller.current?.abort();
    const party = generate();
    const provider = createProvider(settings, keys);
    if (!provider) {
      addSuccess(t('ai.done.party'));
      return;
    }
    const current = new AbortController();
    controller.current = current;
    setWriting(true);
    try {
      const outcome = await generatePartyStory(
        provider,
        party,
        locale,
        current.signal,
      );
      // Keep the story only if the user has not changed the party meanwhile.
      setParty((p) => (p?.id === party.id ? outcome.party : p));
      const alert = outcomeToAlert(
        outcome,
        'party',
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
      console.error('Party story failed', error);
      addError(t('ai.unexpected'));
    } finally {
      if (!current.signal.aborted) setWriting(false);
    }
  }, [
    generate,
    setParty,
    settings,
    keys,
    locale,
    t,
    addSuccess,
    addInfo,
    addWarning,
    addError,
  ]);

  return { generateParty, writing };
};

export default usePartyGenerator;
