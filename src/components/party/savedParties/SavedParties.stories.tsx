import { Meta, StoryObj } from '@storybook/react-vite';
import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import RouterDecorator from '@Test/decorators/RouterDecorator';
import React from 'react';
import { generateParty } from '../../../content/party';
import {
  PartyContext,
  type PartyContextType,
} from '../../../contexts/PartyContext';
import SavedParties from './SavedParties';

const savedParties = [generateParty({ size: 3 }), generateParty({ size: 5 })];

const meta = {
  title: 'Party/SavedParties',
  component: SavedParties,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <PartyContext.Provider
        value={
          {
            savedParties,
            openParty: () => {},
            deleteParty: () => {},
          } as unknown as PartyContextType
        }
      >
        <Story />
      </PartyContext.Provider>
    ),
    AlertManagerDecorator,
    RouterDecorator,
  ],
} satisfies Meta<typeof SavedParties>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoParties: Story = {};
