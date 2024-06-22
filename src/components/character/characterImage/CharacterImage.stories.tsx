import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import { Meta, StoryObj } from '@storybook/react';
import {
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../../../types/character';
import CharacterImage from './CharacterImage';

const meta = {
  title: 'Character/CharacterImage',
  component: CharacterImage,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    gender: {
      description: 'Character gender',
      control: {
        type: 'select',
        options: Object.values(Genders),
      },
    },
    characterClass: {
      description: 'Character class',
      control: {
        type: 'select',
        options: Object.values(CharacterClasses),
      },
    },
    race: {
      description: 'Character race',
      control: {
        type: 'select',
        options: Object.values(CharacterRaces),
      },
    },
  },
  decorators: [CharacterDecorator],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    gender: undefined,
    race: undefined,
    characterClass: undefined,
  },
};

export const HumanWarriorFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Human',
    characterClass: 'Warrior',
  },
};

export const HumanWarriorMale: Story = {
  args: {
    gender: 'Male',
    race: 'Human',
    characterClass: 'Warrior',
  },
};

export const HumanRogueFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Human',
    characterClass: 'Rogue',
  },
};

export const HumanRogueMale: Story = {
  args: {
    gender: 'Male',
    race: 'Human',
    characterClass: 'Rogue',
  },
};

export const HumanMageFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Human',
    characterClass: 'Mage',
  },
};

export const HumanMageMale: Story = {
  args: {
    gender: 'Male',
    race: 'Human',
    characterClass: 'Mage',
  },
};

export const HumanClericFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Human',
    characterClass: 'Cleric',
  },
};

export const HumanClericMale: Story = {
  args: {
    gender: 'Male',
    race: 'Human',
    characterClass: 'Cleric',
  },
};

export const ElfWarriorFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Elf',
    characterClass: 'Warrior',
  },
};

export const ElfWarriorMale: Story = {
  args: {
    gender: 'Male',
    race: 'Elf',
    characterClass: 'Warrior',
  },
};

export const ElfRogueFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Elf',
    characterClass: 'Rogue',
  },
};

export const ElfRogueMale: Story = {
  args: {
    gender: 'Male',
    race: 'Elf',
    characterClass: 'Rogue',
  },
};

export const ElfMageFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Elf',
    characterClass: 'Mage',
  },
};

export const ElfMageMale: Story = {
  args: {
    gender: 'Male',
    race: 'Elf',
    characterClass: 'Mage',
  },
};

export const ElfClericFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Elf',
    characterClass: 'Cleric',
  },
};

export const ElfClericMale: Story = {
  args: {
    gender: 'Male',
    race: 'Elf',
    characterClass: 'Cleric',
  },
};

export const DwarfWarriorFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Dwarf',
    characterClass: 'Warrior',
  },
};

export const DwarfWarriorMale: Story = {
  args: {
    gender: 'Male',
    race: 'Dwarf',
    characterClass: 'Warrior',
  },
};

export const DwarfRogueFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Dwarf',
    characterClass: 'Rogue',
  },
};

export const DwarfRogueMale: Story = {
  args: {
    gender: 'Male',
    race: 'Dwarf',
    characterClass: 'Rogue',
  },
};

export const DwarfMageFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Dwarf',
    characterClass: 'Mage',
  },
};

export const DwarfMageMale: Story = {
  args: {
    gender: 'Male',
    race: 'Dwarf',
    characterClass: 'Mage',
  },
};

export const DwarfClericFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Dwarf',
    characterClass: 'Cleric',
  },
};

export const DwarfClericMale: Story = {
  args: {
    gender: 'Male',
    race: 'Dwarf',
    characterClass: 'Cleric',
  },
};

export const OrcWarriorFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Orc',
    characterClass: 'Warrior',
  },
};

export const OrcWarriorMale: Story = {
  args: {
    gender: 'Male',
    race: 'Orc',
    characterClass: 'Warrior',
  },
};

export const OrcRogueFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Orc',
    characterClass: 'Rogue',
  },
};

export const OrcRogueMale: Story = {
  args: {
    gender: 'Male',
    race: 'Orc',
    characterClass: 'Rogue',
  },
};

export const OrcMageFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Orc',
    characterClass: 'Mage',
  },
};

export const OrcMageMale: Story = {
  args: {
    gender: 'Male',
    race: 'Orc',
    characterClass: 'Mage',
  },
};

export const OrcClericFemale: Story = {
  args: {
    gender: 'Female',
    race: 'Orc',
    characterClass: 'Cleric',
  },
};

export const OrcClericMale: Story = {
  args: {
    gender: 'Male',
    race: 'Orc',
    characterClass: 'Cleric',
  },
};
