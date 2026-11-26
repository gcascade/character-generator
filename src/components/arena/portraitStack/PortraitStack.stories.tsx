import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import PortraitStack from './PortraitStack';

const characters = arenaSetup.contestants.map((c) => c.character);

const meta = {
  title: 'Arena/PortraitStack',
  component: PortraitStack,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { characters: characters.slice(0, 1) },
} satisfies Meta<typeof PortraitStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const One: Story = {};

/** Hover to bring each portrait to the front. */
export const Three: Story = { args: { characters: characters.slice(0, 3) } };

export const Defeated: Story = {
  args: { characters: characters.slice(0, 2), faded: [false, true] },
};
