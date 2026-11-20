import { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from '@mui/material';
import React from 'react';
import { CharacterClasses, CharacterRaces } from '../../../types/character';
import RaceEmblem from './RaceEmblem';

const meta = {
  title: 'Character/RaceEmblem',
  component: RaceEmblem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    race: 'Ashborn',
    characterClass: 'Paladin',
    gender: 'Female',
    height: 290,
    width: 220,
  },
  argTypes: {
    race: { control: 'select', options: Object.values(CharacterRaces) },
    characterClass: {
      control: 'select',
      options: Object.values(CharacterClasses),
    },
  },
} satisfies Meta<typeof RaceEmblem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every race, each with a different class. */
export const AllRaces: Story = {
  render: (args) => (
    <Box
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 160px)', gap: 2 }}
    >
      {Object.values(CharacterRaces).map((race, i) => (
        <RaceEmblem
          key={race}
          {...args}
          race={race}
          characterClass={
            Object.values(CharacterClasses)[
              i % Object.values(CharacterClasses).length
            ]
          }
          height={200}
          width={160}
        />
      ))}
    </Box>
  ),
};
