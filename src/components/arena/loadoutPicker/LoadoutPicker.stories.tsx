import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import LoadoutPicker from './LoadoutPicker';

const meta = {
  title: 'Arena/LoadoutPicker',
  component: LoadoutPicker,
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
    id: 'k',
    perks: [],
    items: [],
    onPerks: fn(),
    onItems: fn(),
  },
} satisfies Meta<typeof LoadoutPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Equipped: Story = {
  args: {
    perks: ['perk-survivalist', 'perk-lucky'],
    items: ['item-sword', 'item-rope', 'item-healing-potion'],
  },
};
