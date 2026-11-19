import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import CharacterHeader from './CharacterHeader';

const meta = {
  title: 'Character/CharacterHeader',
  component: CharacterHeader,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof CharacterHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OrcWarrior: Story = { args: { character: korvusBlackiron } };

export const ElfMage: Story = {
  args: {
    character: {
      ...korvusBlackiron,
      firstName: 'Lathlaer',
      lastName: 'Riverglen',
      race: 'Elf',
      characterClass: 'Mage',
      gender: 'Non-binary',
      age: 166,
    },
  },
};

export const DwarfCleric: Story = {
  args: {
    character: {
      ...korvusBlackiron,
      race: 'Dwarf',
      characterClass: 'Cleric',
      gender: 'Female',
    },
  },
};

export const HumanRogueCompact: Story = {
  args: {
    character: { ...korvusBlackiron, race: 'Human', characterClass: 'Rogue' },
    compact: true,
  },
};
