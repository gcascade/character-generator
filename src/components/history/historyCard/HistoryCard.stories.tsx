import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import HistoryDecorator from '@Test/decorators/HistoryDecorator';
import { historyStub } from '@Test/stubs/History.stubs';
import { Character } from '@Types/character';
import { Meta, StoryObj } from '@storybook/react';
import React, { FC, useEffect } from 'react';
import useCharacterHistory from '../../../hooks/useCharacterHistory';
import HistoryCard from './HistoryCard';

type DemoComponentProps = {
  history: Character[];
};

const DemoComponent: FC<DemoComponentProps> = ({ history }) => {
  const { addToHistory } = useCharacterHistory();

  useEffect(() => {
    addToHistory(history);
  }, []);

  return <HistoryCard />;
};

const meta: Meta<DemoComponentProps> = {
  title: 'History/HistoryCard',
  component: HistoryCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [HistoryDecorator, CharacterDecorator, AlertManagerDecorator],
  render: function RenderStory(args) {
    return <DemoComponent {...args} />;
  },
  argTypes: {
    history: {
      description: 'List of characters to display',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<DemoComponentProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithEmptyHistory: Story = {
  args: {
    history: [],
  },
};

export const WithHistory: Story = {
  args: {
    history: historyStub,
  },
};
