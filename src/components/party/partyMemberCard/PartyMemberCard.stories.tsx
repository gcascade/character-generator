import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { generateParty } from '../../../content/party';
import PartyMemberCard from './PartyMemberCard';

const [member] = generateParty({ size: 2 }).members;

const meta = {
  title: 'Party/PartyMemberCard',
  component: PartyMemberCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { member, onToggleLock: fn(), onReroll: fn(), onSave: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PartyMemberCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Kept: Story = { args: { member: { ...member, locked: true } } };
export const NotMatching: Story = { args: { notMatching: true } };
