import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { generateParty } from '../../../content/party';
import PartyTies from './PartyTies';

const base = generateParty({ size: 4 });
const [a, b, c] = base.members;

const meta = {
  title: 'Party/PartyTies',
  component: PartyTies,
  tags: ['autodocs'],
  args: { onReroll: fn(), onRemove: fn() },
} satisfies Meta<typeof PartyTies>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoTies: Story = {
  args: {
    party: {
      ...base,
      ties: [
        { id: '1', type: 'tie-rivals', from: a.id, to: b.id },
        { id: '2', type: 'tie-mentor', from: c.id, to: a.id },
      ],
    },
  },
};

export const NoTies: Story = { args: { party: { ...base, ties: [] } } };
