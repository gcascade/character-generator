import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { createRandom } from '../../../content/random';
import { rollSkills } from '../../../content/skills';
import SkillGrid from './SkillGrid';

const meta = {
  title: 'Arena/SkillGrid',
  component: SkillGrid,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 360 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    name: 'Korvus',
    skills: rollSkills(
      { race: 'Orc', characterClass: 'Warrior', age: 30 },
      createRandom('story'),
    ),
  },
} satisfies Meta<typeof SkillGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Warrior: Story = {};

export const ElderlyMage: Story = {
  args: {
    name: 'Ilvara',
    skills: rollSkills(
      { race: 'Elf', characterClass: 'Mage', age: 650 },
      createRandom('story-mage'),
    ),
  },
};
