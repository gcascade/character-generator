import { SettingsProvider } from '@Contexts/SettingsContext';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';

const SettingsDecorator: Decorator = (Story) => (
  <SettingsProvider>
    <Story />
  </SettingsProvider>
);

export default SettingsDecorator;
