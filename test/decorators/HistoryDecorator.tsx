import { HistoryProvider } from '@Contexts/HistoryContext';
import { StoryFn } from '@storybook/react-vite';
import React from 'react';

const HistoryDecorator = (Story: StoryFn): JSX.Element => (
  <HistoryProvider>
    <Story />
  </HistoryProvider>
);

export default HistoryDecorator;
