import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { NpcProvider } from '../../../contexts/NpcContext';
import NpcControls from './NpcControls';

const meta = {
  title: 'NPC/NpcControls',
  component: NpcControls,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NpcProvider>
        <Story />
      </NpcProvider>
    ),
  ],
  args: { onGenerate: fn(), onGenerateBatch: fn() },
} satisfies Meta<typeof NpcControls>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Generating: Story = { args: { generating: true } };
