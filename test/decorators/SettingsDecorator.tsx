import { SettingsProvider } from '@Contexts/SettingsContext';
import { StoryFn } from '@storybook/react-vite';
import React from 'react';

const SettingsDecorator = (Story: StoryFn): JSX.Element => (
  <SettingsProvider>
    <Story />
  </SettingsProvider>
);

export default SettingsDecorator;
