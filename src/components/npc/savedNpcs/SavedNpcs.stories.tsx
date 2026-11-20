import { brennaThistledown } from '@Test/stubs/Npc.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { NpcContext, type NpcContextType } from '../../../contexts/NpcContext';
import { generateNpc } from '../../../content/npc';
import SavedNpcs from './SavedNpcs';

const withSaved = (savedNpcs: NpcContextType['savedNpcs']) =>
  ({
    savedNpcs,
  }) as unknown as NpcContextType;

const meta = {
  title: 'NPC/SavedNpcs',
  component: SavedNpcs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof SavedNpcs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSideCharacters: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <NpcContext.Provider
          value={withSaved([
            { ...brennaThistledown, id: 'b' },
            { ...generateNpc({ race: 'Dark elf' }), id: 'd' },
            { ...generateNpc({ occupation: 'Gravedigger' }), id: 'g' },
          ])}
        >
          <Story />
        </NpcContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export const Empty: Story = {
  decorators: [
    (Story) => (
      <NpcContext.Provider value={withSaved([])}>
        <Story />
      </NpcContext.Provider>
    ),
  ],
};
