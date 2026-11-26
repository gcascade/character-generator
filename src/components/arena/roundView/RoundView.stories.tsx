import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { simulate } from '../../../content/arena';
import RoundView from './RoundView';

const match = simulate(arenaSetup);

const meta = {
  title: 'Arena/RoundView',
  component: RoundView,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 720 }}>
        <Story />
      </Box>
    ),
  ],
  args: { round: match.rounds[0], setup: arenaSetup, standing: 5 },
} satisfies Meta<typeof RoundView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Day: Story = {};

export const Night: Story = {
  args: { round: match.rounds[1] ?? match.rounds[0] },
};

export const Finale: Story = {
  args: { round: match.rounds.at(-1)!, finale: true, standing: 1 },
};
