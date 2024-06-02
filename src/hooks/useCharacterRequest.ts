import { useContext } from 'react';
import { RequestContext } from '../contexts/RequestContext';
import { Character } from '../types/character';
import useCharacterGenerator from './useCharacterGenerator';
import useSettings from './useSettings';

const useCharacterRequest = (delayTime = 1000) => {
  const requestContext = useContext(RequestContext);

  if (!requestContext) {
    throw new Error(
      'useCharacterRequest must be used within a RequestProvider',
    );
  }

  const { requestStatus, setRequestStatus, error, setError } = requestContext;
  const {
    settings: { useOllamaAPI, ollamaEndpoint, ollamaModelName },
  } = useSettings();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { generateNewCharacter, rerollCharacterProperty } =
    useCharacterGenerator();

  const callWithDelay = async (
    action: () => Promise<void>,
    doneCallback?: VoidFunction,
  ) => {
    try {
      await delay(delayTime);
      await action();
      setRequestStatus('success');
    } catch (e) {
      console.log('error thrown inside action', e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
      setRequestStatus('failure');
    } finally {
      if (doneCallback) {
        doneCallback();
      }
    }
  };

  const callRerollCharacterProperty = (
    property: keyof Character,
    doneCallback?: VoidFunction,
  ) => {
    setRequestStatus('loading');
    callWithDelay(
      async () =>
        rerollCharacterProperty(property, {
          useOllamaAPI,
          ollamaEndpoint,
          ollamaModelName,
        }),
      doneCallback,
    );
  };

  const callGenerateNewCharacter = (doneCallback?: VoidFunction) => {
    setRequestStatus('loading');
    callWithDelay(async () => {
      await generateNewCharacter({
        useOllamaAPI,
        ollamaEndpoint,
        ollamaModelName,
      });
    }, doneCallback);
  };

  return {
    requestStatus,
    error,
    generateNewCharacter: callGenerateNewCharacter,
    rerollCharacterProperty: callRerollCharacterProperty,
  };
};

export default useCharacterRequest;
