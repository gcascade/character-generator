import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import NpcSheet from './NpcSheet';

const meta = {
  title: 'NPC/NpcSheet',
  component: NpcSheet,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { npc: brennaThistledown },
} satisfies Meta<typeof NpcSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Read-only, as on a saved or shared side character. */
export const ReadOnly: Story = {
  args: { footer: <Button variant="contained">Save</Button> },
};

/** On the side-character page: dice and padlocks. */
export const WithActions: Story = {
  args: {
    actions: {
      onReroll: fn(),
      onToggleLock: fn(),
      isLocked: (property) => property === 'occupation',
    },
  },
};
