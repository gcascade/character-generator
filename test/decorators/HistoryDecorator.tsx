import { HistoryProvider } from '@Contexts/HistoryContext';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';

const HistoryDecorator: Decorator = (Story) => (
  <HistoryProvider>
    <Story />
  </HistoryProvider>
);

export default HistoryDecorator;
