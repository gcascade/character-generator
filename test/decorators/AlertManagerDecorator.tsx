import { AlertManagerProvider } from '@Contexts/AlertManagerContext';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';

const AlertManagerDecorator: Decorator = (Story) => (
  <AlertManagerProvider>
    <Story />
  </AlertManagerProvider>
);

export default AlertManagerDecorator;
