import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import NpcPortrait from './NpcPortrait';

const meta = {
  title: 'NPC/NpcPortrait',
  component: NpcPortrait,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { npc: brennaThistledown, height: 260, width: 220 },
} satisfies Meta<typeof NpcPortrait>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Without a painted portrait: the race emblem with the occupation. */
export const Emblem: Story = {};
