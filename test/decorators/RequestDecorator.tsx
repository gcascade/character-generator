import { RequestProvider } from '@Contexts/RequestContext';
import { StoryFn } from '@storybook/react-vite';
import React from 'react';

const RequestDecorator = (Story: StoryFn): JSX.Element => (
  <RequestProvider>
    <Story />
  </RequestProvider>
);

export default RequestDecorator;
