import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { generateParty } from '../../../content/party';
import RosterBuilder from './RosterBuilder';

const party = generateParty({ size: 4 });

const meta = {
  title: 'Arena/RosterBuilder',
  component: RosterBuilder,
  tags: ['autodocs'],
  args: {
    count: 6,
    current: korvusBlackiron,
    saved: [{ ...korvusBlackiron, id: 'k1' }],
    party,
    savedParties: [party],
    onAddCharacter: fn(),
    onAddParty: fn(),
    onAddRandom: fn(),
    onRandomLoadouts: fn(),
    onClear: fn(),
  },
} satisfies Meta<typeof RosterBuilder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithEverything: Story = {};

export const NothingSaved: Story = {
  args: { saved: [], savedParties: [], party: undefined, count: 0 },
};

export const Full: Story = { args: { count: 48 } };
