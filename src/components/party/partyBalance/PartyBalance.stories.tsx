import { Meta, StoryObj } from '@storybook/react-vite';
import { generateParty } from '../../../content/party';
import PartyBalance from './PartyBalance';

const meta = {
  title: 'Party/PartyBalance',
  component: PartyBalance,
  tags: ['autodocs'],
} satisfies Meta<typeof PartyBalance>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Random: Story = { args: { party: generateParty({ size: 4 }) } };
export const AllClerics: Story = {
  args: {
    party: generateParty({
      size: 3,
      constraints: { characterClass: 'Cleric' },
    }),
  },
};
