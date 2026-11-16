import { DataProvider } from '@Contexts/DataContext';
import { StoryFn } from '@storybook/react-vite';
import React from 'react';

const DataDecorator = (Story: StoryFn): JSX.Element => (
  <DataProvider>
    <Story />
  </DataProvider>
);

export default DataDecorator;
