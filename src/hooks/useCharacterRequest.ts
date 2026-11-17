import { useCallback, useContext, useEffect, useRef } from 'react';
import { isCallerAbort } from '../ai/errors';
import { outcomeToAlert, providerContext } from '../ai/messages';
import { createProvider } from '../ai/providers';
import type { AiProvider } from '../ai/providers';
import type { GenerationOutcome } from '../ai/types';
import { RequestContext } from '../contexts/RequestContext';
import { Character } from '../types/character';
import useAlert from './useAlert';
import useCharacterGenerator from './useCharacterGenerator';
import useSettings from './useSettings';

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
  const { generateNewCharacter, rerollCharacterProperty } =
    useCharacterGenerator();
  const { addSuccess, addInfo, addWarning, addError } = useAlert();
  const controller = useRef<AbortController | null>(null);

  // A result arriving after the component is gone must not change anything.
  useEffect(() => () => controller.current?.abort(), []);

  const run = useCallback(
    async (
      kind: 'generate' | 'reroll',
      action: (
        provider: AiProvider | undefined,
        signal: AbortSignal,
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
        );
        const alert = outcomeToAlert(outcome, kind, providerContext(settings));
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
        addError('Something went wrong while generating the character.');
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
    ],
  );

  const generate = useCallback(
    (options: CharacterRequestOptions = {}) =>
      run('generate', generateNewCharacter, options),
    [run, generateNewCharacter],
  );

  const reroll = useCallback(
    (property: keyof Character, options: CharacterRequestOptions = {}) =>
      run(
        'reroll',
        (provider, signal) =>
          rerollCharacterProperty(property, provider, signal),
        options,
      ),
    [run, rerollCharacterProperty],
  );

  return {
    requestStatus,
    error,
    generateNewCharacter: generate,
    rerollCharacterProperty: reroll,
  };
};

export default useCharacterRequest;
