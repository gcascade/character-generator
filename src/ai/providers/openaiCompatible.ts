import {
  AiError,
  causeFromStatus,
  isInsecureAddress,
  throwIfAborted,
} from '../errors';
import type { ProviderType } from '../types';
import type { AiProvider, CompletionRequest } from './provider';

type Options = {
  providerType: Exclude<ProviderType, 'none'>;
  /** Base URL of the OpenAI-compatible API, e.g. `https://api.openai.com/v1`. */
  baseUrl: string;
  model: string;
  apiKey?: string;
};

type ChatCompletion = {
  choices?: { message?: { content?: unknown } }[];
};

type ModelList = { data?: { id?: unknown }[] };

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path}`;

/**
 * Adapter for every service speaking the OpenAI chat-completions protocol
 * (OpenAI, GitHub Models, Mistral, OpenRouter, LM Studio, and Ollama under `/v1`).
 */
export const createOpenAiCompatibleProvider = ({
  providerType,
  baseUrl,
  model,
  apiKey,
}: Options): AiProvider => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const request = async (
    path: string,
    init: RequestInit & { signal: AbortSignal },
  ): Promise<Response> => {
    const url = joinUrl(baseUrl, path);
    if (isInsecureAddress(url)) {
      throw new AiError('blocked-insecure', providerType);
    }
    try {
      return await fetch(url, { ...init, headers });
    } catch (error) {
      throwIfAborted(init.signal, providerType);
      throw new AiError('unreachable', providerType, {
        detail: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const readJson = async <T>(response: Response, signal: AbortSignal) => {
    try {
      return (await response.json()) as T;
    } catch {
      throwIfAborted(signal, providerType);
      throw new AiError('invalid-answer', providerType);
    }
  };

  return {
    type: providerType,

    async complete({ system, prompt, signal }: CompletionRequest) {
      const response = await request('chat/completions', {
        method: 'POST',
        signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new AiError(
          causeFromStatus(response.status, body),
          providerType,
          {
            status: response.status,
          },
        );
      }
      const completion = await readJson<ChatCompletion>(response, signal);
      const content = completion.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        throw new AiError('invalid-answer', providerType);
      }
      return content;
    },

    async listModels(signal: AbortSignal) {
      const response = await request('models', { method: 'GET', signal });
      if (response.status === 404 || response.status === 405) return undefined;
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new AiError(
          causeFromStatus(response.status, body),
          providerType,
          {
            status: response.status,
          },
        );
      }
      const list = await readJson<ModelList>(response, signal);
      if (!Array.isArray(list.data)) return undefined;
      return list.data
        .map((entry) => entry.id)
        .filter((id): id is string => typeof id === 'string');
    },
  };
};
