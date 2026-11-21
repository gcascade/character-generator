import { Box } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { fn } from 'storybook/test';
import { generateRandomCharacter } from '../../../content/generate';
import { subjectOfCharacter } from '../../../content/portraitPrompt';
import { AlertManagerProvider } from '../../../contexts/AlertManagerContext';
import { PortraitProvider } from '../../../contexts/PortraitContext';
import PaintPortrait from './PaintPortrait';

const meta = {
  title: 'Portrait/PaintPortrait',
  component: PaintPortrait,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AlertManagerProvider>
        <PortraitProvider>
          <Box sx={{ width: 300 }}>
            <Story />
          </Box>
        </PortraitProvider>
      </AlertManagerProvider>
    ),
  ],
  args: {
    subject: subjectOfCharacter(
      generateRandomCharacter({ race: 'Gnome', characterClass: 'Bard' }),
    ),
    onPainted: fn(),
    onRemoved: fn(),
  },
} satisfies Meta<typeof PaintPortrait>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Before painting: the button opens the privacy notice. */
export const Default: Story = {};
