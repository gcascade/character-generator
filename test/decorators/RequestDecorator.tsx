import { RequestProvider } from '@Contexts/RequestContext';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';

const RequestDecorator: Decorator = (Story) => (
  <RequestProvider>
    <Story />
  </RequestProvider>
);

export default RequestDecorator;
