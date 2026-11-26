import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { createRandom } from '../../../content/random';
import { rollSkills } from '../../../content/skills';
import ContestantCard from './ContestantCard';

const meta = {
  title: 'Arena/ContestantCard',
  component: ContestantCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 380 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    contestant: {
      id: 'c1',
      character: korvusBlackiron,
      sideId: 'c1',
      perks: [],
      items: [],
    },
    skills: rollSkills(korvusBlackiron, createRandom('story')),
  },
} satisfies Meta<typeof ContestantCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InRoster: Story = { args: { onRemove: fn() } };

export const ReadOnly: Story = {};
