import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiError } from '../../../ai/errors';
import ConnectionTest from './ConnectionTest';

const provider = {
  name: 'Ollama',
  address: 'http://localhost:11434',
  model: 'llama3',
};

const meta = {
  title: 'Settings/ConnectionTest',
  component: ConnectionTest,
  tags: ['autodocs'],
  args: { provider },
} satisfies Meta<typeof ConnectionTest>;

export default meta;
type Story = StoryObj<typeof meta>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const Success: Story = {
  args: {
    onTest: async () => {
      await wait(800);
      return { ok: true, model: 'llama3', models: ['llama3', 'mistral'] };
    },
  },
};

export const Unreachable: Story = {
  args: {
    onTest: async () => {
      await wait(800);
      return { ok: false, error: new AiError('unreachable', 'ollama') };
    },
  },
};

export const RefusedKey: Story = {
  args: {
    provider: { name: 'Claude', model: 'claude-opus-5-5' },
    onTest: async () => ({
      ok: false,
      error: new AiError('auth', 'anthropic'),
    }),
  },
};
