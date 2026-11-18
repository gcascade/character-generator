import { useCallback, useContext, useEffect, useRef } from 'react';
import { isCallerAbort } from '../ai/errors';
import { outcomeToAlert, providerContext } from '../ai/messages';
import { createProvider } from '../ai/providers';
import type { AiProvider } from '../ai/providers';
import type { GenerationOutcome } from '../ai/types';
import { CharacterContext } from '../contexts/CharacterContext';
import { LockContext } from '../contexts/LockContext';
import { RequestContext } from '../contexts/RequestContext';
import { type LockableProperty, templateOf } from '../content/template';
import { Character } from '../types/character';
import useAlert from './useAlert';
import useCharacterGenerator from './useCharacterGenerator';
import useSettings from './useSettings';
import { useT } from '../i18n';
import { type Locale, useLocale } from '../i18n';
import type { OutcomeKind } from '../ai/messages';

const NO_LOCKS: readonly LockableProperty[] = [];

type CharacterRequestOptions = {
  /** Called once the request is over, whatever its outcome. */
  doneCallback?: VoidFunction;
};

/**
 * Runs generations and rerolls for a component: tracks the loading state,
 * shows the outcome alert, and cancels the request if the component unmounts.
 */
const useCharacterRequest = () => {
  const requestContext = useContext(RequestContext);

  if (!requestContext) {
    throw new Error(
      'useCharacterRequest must be used within a RequestProvider',
    );
  }

  const { requestStatus, setRequestStatus, error, setError } = requestContext;
  const { settings, keys } = useSettings();
  const { generateNewCharacter, rerollCharacterProperty, translateCharacter } =
    useCharacterGenerator();
  const { addSuccess, addInfo, addWarning, addError } = useAlert();
  const t = useT();
  const { locale } = useLocale();
  const controller = useRef<AbortController | null>(null);
  // Locks are optional: without a LockProvider nothing is locked (spec 003).
  const locked = useContext(LockContext)?.locked ?? NO_LOCKS;
  const character = useContext(CharacterContext)?.character;

  // A result arriving after the component is gone must not change anything.
  useEffect(() => () => controller.current?.abort(), []);

  const run = useCallback(
    async (
      kind: OutcomeKind,
      action: (
        provider: AiProvider | undefined,
        signal: AbortSignal,
        locale: Locale,
      ) => Promise<GenerationOutcome>,
      { doneCallback }: CharacterRequestOptions,
    ) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setRequestStatus('loading');

      try {
        const outcome = await action(
          createProvider(settings, keys),
          current.signal,
          locale,
        );
        const alert = outcomeToAlert(
          outcome,
          kind,
          providerContext(settings),
          t,
        );
        const show = {
          success: addSuccess,
          info: addInfo,
          warning: addWarning,
          error: addError,
        }[alert.severity];
        show(alert.message);
        setError(outcome.failure ? alert.message : '');
        setRequestStatus(outcome.failure ? 'failure' : 'success');
      } catch (caught) {
        if (isCallerAbort(caught)) {
          setRequestStatus('success');
          return;
        }
        console.error('Character request failed', caught);
        setError('Something went wrong');
        setRequestStatus('failure');
        addError(t('ai.unexpected'));
      } finally {
        if (!current.signal.aborted) doneCallback?.();
      }
    },
    [
      settings,
      keys,
      setRequestStatus,
      setError,
      addSuccess,
      addInfo,
      addWarning,
      addError,
      t,
      locale,
    ],
  );

  const generate = useCallback(
    (options: CharacterRequestOptions = {}) =>
      run(
        'generate',
        (provider, signal, language) =>
          generateNewCharacter(
            provider,
            signal,
            language,
            character ? templateOf(character, locked) : {},
          ),
        options,
      ),
    [run, generateNewCharacter, character, locked],
  );

  const reroll = useCallback(
    (property: keyof Character, options: CharacterRequestOptions = {}) =>
      run(
        'reroll',
        (provider, signal, language) =>
          rerollCharacterProperty(property, provider, signal, language, locked),
        options,
      ),
    [run, rerollCharacterProperty, locked],
  );

  /** Rewrites AI-written text in the interface language (spec 002 FR-015a). */
  const translate = useCallback(
    (options: CharacterRequestOptions = {}) =>
      run(
        'translate',
        (provider, signal, language) =>
          provider
            ? translateCharacter(provider, signal, language)
            : Promise.reject(new DOMException('No provider', 'AbortError')),
        options,
      ),
    [run, translateCharacter],
  );

  return {
    canUseAi: settings.activeType !== 'none',
    translateCharacter: translate,
    requestStatus,
    error,
    generateNewCharacter: generate,
    rerollCharacterProperty: reroll,
  };
};

export default useCharacterRequest;
