import { AlertManagerProvider } from '@Contexts/AlertManagerContext';
import { StoryFn } from '@storybook/react/*';
import React from 'react';

const AlertManagerDecorator = (Story: StoryFn): JSX.Element => (
  <AlertManagerProvider>
    <Story />
  </AlertManagerProvider>
);

export default AlertManagerDecorator;
