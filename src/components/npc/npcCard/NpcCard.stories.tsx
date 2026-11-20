import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import NpcCard from './NpcCard';

const meta = {
  title: 'NPC/NpcCard',
  component: NpcCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 260 }}>
        <Story />
      </Box>
    ),
  ],
  args: { npc: brennaThistledown },
} satisfies Meta<typeof NpcCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** In the batch of five. */
export const InBatch: Story = { args: { onOpen: fn(), onSave: fn() } };

export const Saved: Story = {
  args: { onOpen: fn(), onSave: fn(), saved: true },
};

export const ReadOnly: Story = {};
