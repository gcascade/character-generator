import { Meta, StoryObj } from '@storybook/react-vite';
import { generateParty } from '../../../content/party';
import PartyStory from './PartyStory';

const meta = {
  title: 'Party/PartyStory',
  component: PartyStory,
  tags: ['autodocs'],
} satisfies Meta<typeof PartyStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FourMembers: Story = {
  args: { party: generateParty({ size: 4 }) },
};
export const SixMembers: Story = {
  args: { party: generateParty({ size: 6 }) },
};
