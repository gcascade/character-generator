import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AiError } from '../../../ai/errors';
import ConnectionTest from './ConnectionTest';

const provider = {
  name: 'Ollama',
  address: 'http://localhost:11434',
  model: 'llama3',
};

describe('ConnectionTest', () => {
  it('shows the model on success and reports the result', async () => {
    const onResult = vi.fn();
    const result = {
      ok: true as const,
      model: 'llama3',
      models: ['llama3', 'mistral'],
    };
    render(
      <ConnectionTest
        provider={provider}
        onTest={async () => result}
        onResult={onResult}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Test connection' }),
    );

    expect(
      await screen.findByText(
        /Connected to Ollama with the model "llama3"\. 2 models available/,
      ),
    ).toBeInTheDocument();
    expect(onResult).toHaveBeenCalledWith(result);
  });

  it('names the cause on failure', async () => {
    render(
      <ConnectionTest
        provider={provider}
        onTest={async () => ({
          ok: false,
          error: new AiError('unknown-model', 'ollama'),
        })}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Test connection' }),
    );
    expect(
      await screen.findByText(
        'Ollama doesn\'t know the model "llama3". Pick another one in Settings.',
      ),
    ).toBeInTheDocument();
  });

  it('disables the button while the test runs', async () => {
    let finish: (value: { ok: true; model: string }) => void = () => {};
    render(
      <ConnectionTest
        provider={provider}
        onTest={() => new Promise((resolve) => (finish = resolve))}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Test connection' }),
    );
    expect(screen.getByRole('button', { name: 'Testing…' })).toBeDisabled();
    finish({ ok: true, model: 'llama3' });
    expect(
      await screen.findByRole('button', { name: 'Test connection' }),
    ).toBeEnabled();
  });
});
