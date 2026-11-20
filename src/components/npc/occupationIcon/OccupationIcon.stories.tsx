import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Occupations } from '../../../types/npc';
import OccupationIcon from './OccupationIcon';

const meta = {
  title: 'NPC/OccupationIcon',
  component: OccupationIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { occupation: 'Blacksmith' },
  argTypes: {
    occupation: { control: 'select', options: Object.values(Occupations) },
  },
} satisfies Meta<typeof OccupationIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every occupation. */
export const All: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 400 }}>
      {Object.values(Occupations).map((occupation) => (
        <OccupationIcon key={occupation} occupation={occupation} />
      ))}
    </Box>
  ),
};
