import { useContext } from 'react';
import { RequestContext } from '../contexts/RequestContext';
import { Character } from '../types/character';
import useCharacterGenerator from './useCharacterGenerator';
import useSettings from './useSettings';

type CharacterRequestOptions = {
  doneCallback?: VoidFunction;
  onSuccess?: VoidFunction;
  onError?: (message: string) => void;
};

type ApiParams = {
  apiType: 'ollama' | 'azure' | 'none';
  endpoint?: string;
  modelName?: string;
  token?: string;
};

const useCharacterRequest = (delayTime = 1000) => {
  const requestContext = useContext(RequestContext);

  if (!requestContext) {
    throw new Error(
      'useCharacterRequest must be used within a RequestProvider',
    );
  }

  const { requestStatus, setRequestStatus, error, setError } = requestContext;
  const {
    ollamaSettings: { useOllamaAPI, ollamaEndpoint, ollamaModelName },
    azureSettings: { useAzureAPI, azureEndpoint, azureModelName, azureToken },
  } = useSettings();

  const params: ApiParams = {
    apiType: useOllamaAPI ? 'ollama' : useAzureAPI ? 'azure' : 'none',
    endpoint: useOllamaAPI
      ? ollamaEndpoint
      : useAzureAPI
        ? azureEndpoint
        : undefined,
    modelName: useOllamaAPI
      ? ollamaModelName
      : useAzureAPI
        ? azureModelName
        : undefined,
    token: useAzureAPI ? azureToken : undefined,
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { generateNewCharacter, rerollCharacterProperty } =
    useCharacterGenerator();

  const callWithDelay = async (
    action: () => Promise<void>,
    doneCallback?: VoidFunction,
    onSuccess?: VoidFunction,
    onError?: (message: string) => void,
  ) => {
    try {
      await delay(delayTime);
      await action();
      setRequestStatus('success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.log('error thrown inside action', e);
      let message;
      if (e instanceof Error) {
        message = e.message;
      } else {
        message = 'An unknown error occurred';
      }
      if (onError) {
        onError(message);
      }
      setError(message);
      setRequestStatus('failure');
    } finally {
      if (doneCallback) {
        doneCallback();
      }
    }
  };

  const callRerollCharacterProperty = (
    property: keyof Character,
    { doneCallback, onSuccess, onError }: CharacterRequestOptions,
  ) => {
    setRequestStatus('loading');
    callWithDelay(
      async () => rerollCharacterProperty(property, params),
      doneCallback,
      onSuccess,
      onError,
    );
  };

  const callGenerateNewCharacter = ({
    doneCallback,
    onSuccess,
    onError,
  }: CharacterRequestOptions) => {
    setRequestStatus('loading');
    callWithDelay(
      async () => {
        await generateNewCharacter(params);
      },
      doneCallback,
      onSuccess,
      onError,
    );
  };

  return {
    requestStatus,
    error,
    generateNewCharacter: callGenerateNewCharacter,
    rerollCharacterProperty: callRerollCharacterProperty,
  };
};

export default useCharacterRequest;
