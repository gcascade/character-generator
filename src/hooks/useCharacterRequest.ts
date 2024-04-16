import { useState } from 'react';
import { Character } from '../types/character';
import { RequestStatus } from '../types/requests';
import useCharacterGenerator from './useCharacterGenerator';

const useCharacterRequest = (delayTime = 1000) => {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('success');
  const [error, setError] = useState('');
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const { generateNewCharacter, rerollCharacterProperty } =
    useCharacterGenerator();

  const callRerollCharacterProperty = (
    property: keyof Character,
    doneCallback?: VoidFunction,
  ) => {
    const delayFunction = async () => {
      try {
        await delay(delayTime);
        rerollCharacterProperty(property);
        setRequestStatus('success');
        if (doneCallback) {
          doneCallback();
        }
      } catch (e) {
        console.log('error thrown inside reroll property', e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
        setRequestStatus('failure');
        if (doneCallback) {
          doneCallback();
        }
      }
    };
    setRequestStatus('loading');
    delayFunction();
  };

  const callGenerateNewCharacter = (doneCallback?: VoidFunction) => {
    const delayFunction = async () => {
      try {
        await delay(delayTime);
        generateNewCharacter();
        setRequestStatus('success');
        if (doneCallback) {
          doneCallback();
        }
      } catch (e) {
        console.log('error thrown inside reroll property', e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
        setRequestStatus('failure');
        if (doneCallback) {
          doneCallback();
        }
      }
    };
    setRequestStatus('loading');
    delayFunction();
  };

  return {
    requestStatus,
    error,
    generateNewCharacter: callGenerateNewCharacter,
    rerollCharacterProperty: callRerollCharacterProperty,
  };
};

export default useCharacterRequest;
