import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { generateParty } from '../../../content/party';
import AdventureHook from './AdventureHook';

const meta = {
  title: 'Party/AdventureHook',
  component: AdventureHook,
  tags: ['autodocs'],
  args: { party: generateParty({ size: 4 }), onReroll: fn() },
} satisfies Meta<typeof AdventureHook>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ReadOnly: Story = { args: { onReroll: undefined } };
