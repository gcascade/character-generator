import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { simulate } from '../../../content/arena';
import ContestantStatus from './ContestantStatus';

const match = simulate(arenaSetup);

const meta = {
  title: 'Arena/ContestantStatus',
  component: ContestantStatus,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 360 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    setup: arenaSetup,
    state: match.rounds[0].after,
    moment: 'After Day 1',
  },
} satisfies Meta<typeof ContestantStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EarlyOn: Story = {};

export const AtTheEnd: Story = {
  args: { state: match.rounds.at(-1)!.after, moment: 'After the finale' },
};
