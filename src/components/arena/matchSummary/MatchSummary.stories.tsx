import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { simulate, summarize } from '../../../content/arena';
import MatchSummary from './MatchSummary';

const summary = summarize(arenaSetup, simulate(arenaSetup));

const meta = {
  title: 'Arena/MatchSummary',
  component: MatchSummary,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 720 }}>
        <Story />
      </Box>
    ),
  ],
  args: { setup: arenaSetup, summary },
} satisfies Meta<typeof MatchSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Solo: Story = {};

export const TeamWins: Story = {
  args: { summary: { ...summary, winners: ['aela', 'brom'] } },
};
