import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { AI_ERROR_CAUSES, AiError } from './errors';
import { outcomeToAlert, providerContext } from './messages';
import { DEFAULT_SETTINGS } from './storage';
import type { GenerationOutcome } from './types';

const ollama = providerContext({ ...DEFAULT_SETTINGS, activeType: 'ollama' })!;

const outcome = (overrides: Partial<GenerationOutcome>): GenerationOutcome => ({
  character: korvusBlackiron,
  source: 'ai',
  completedFields: [],
  ...overrides,
});

describe('providerContext', () => {
  it('names each provider type', () => {
    expect(providerContext(DEFAULT_SETTINGS)).toBeUndefined();
    expect(ollama).toEqual({
      name: 'Ollama',
      address: 'http://localhost:11434',
      model: 'llama3',
    });
    expect(
      providerContext({ ...DEFAULT_SETTINGS, activeType: 'anthropic' })?.name,
    ).toBe('Claude');
    expect(
      providerContext({ ...DEFAULT_SETTINGS, activeType: 'openai-compatible' })
        ?.name,
    ).toBe('models.github.ai');
  });
});

describe('outcomeToAlert', () => {
  it('shows a plain success without AI', () => {
    expect(
      outcomeToAlert(outcome({ source: 'app' }), 'generate', undefined),
    ).toEqual({
      severity: 'success',
      message: 'New character generated',
    });
  });

  it('names the provider on a full AI result', () => {
    expect(outcomeToAlert(outcome({}), 'reroll', ollama)).toEqual({
      severity: 'success',
      message: 'Character updated with Ollama.',
    });
  });

  it('lists the fields completed by the generator', () => {
    const alert = outcomeToAlert(
      outcome({
        source: 'ai-completed',
        completedFields: ['lastName', 'epithet'],
      }),
      'generate',
      ollama,
    );
    expect(alert.severity).toBe('info');
    expect(alert.message).toContain('the last name and the epithet');
  });

  it.each(AI_ERROR_CAUSES)(
    'explains the "%s" failure and the fallback',
    (cause) => {
      const generated = outcomeToAlert(
        outcome({
          source: 'app',
          failure: new AiError(cause, 'ollama', { status: 500 }),
        }),
        'generate',
        ollama,
      );
      expect(generated.severity).toBe('warning');
      expect(generated.message).toMatch(
        /A character was generated without AI\.$/,
      );

      const rerolled = outcomeToAlert(
        outcome({ source: 'app', failure: new AiError(cause, 'ollama') }),
        'reroll',
        ollama,
      );
      expect(rerolled.message).toMatch(
        /The background comes from the generator\.$/,
      );
    },
  );

  it('says where to fix the problem when the user can', () => {
    const message = (cause: (typeof AI_ERROR_CAUSES)[number]) =>
      outcomeToAlert(
        outcome({ source: 'app', failure: new AiError(cause, 'ollama') }),
        'generate',
        ollama,
      ).message;
    expect(message('unreachable')).toContain('http://localhost:11434');
    expect(message('unreachable')).toContain('OLLAMA_ORIGINS');
    expect(message('auth')).toContain('Settings');
    expect(message('unknown-model')).toContain('"llama3"');
  });
});
