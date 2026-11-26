import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import { PeekCard } from './ContestantPeek';

const meta = {
  title: 'Arena/ContestantPeek',
  component: PeekCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { setup: arenaSetup, id: 'korvus' },
} satisfies Meta<typeof PeekCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BeforeTheMatch: Story = {};

export const Wounded: Story = {
  args: {
    state: {
      hp: 8,
      maxHp: 34,
      items: ['item-axe', 'item-healing-potion'],
      standing: true,
      sideId: 'korvus',
      defeats: 1,
    },
  },
};
