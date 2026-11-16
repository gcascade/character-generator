import { DataProvider } from '@Contexts/DataContext';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';

const DataDecorator: Decorator = (Story) => (
  <DataProvider>
    <Story />
  </DataProvider>
);

export default DataDecorator;
