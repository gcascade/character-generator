import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import ApiKeyField from './ApiKeyField';

const meta = {
  title: 'Settings/ApiKeyField',
  component: ApiKeyField,
  tags: ['autodocs'],
  args: {
    providerName: 'Claude',
    value: '',
    remember: true,
    hasStoredKey: false,
    onChange: fn(),
    onRememberChange: fn(),
    onForget: fn(),
  },
} satisfies Meta<typeof ApiKeyField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const StoredKey: Story = {
  args: { value: 'sk-ant-xxxxxxxx', hasStoredKey: true },
};

export const SessionOnly: Story = {
  args: { value: 'sk-ant-xxxxxxxx', hasStoredKey: true, remember: false },
};

export const WithError: Story = {
  args: { error: 'Enter your API key', required: true },
};
