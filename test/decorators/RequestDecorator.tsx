import { RequestProvider } from '@Contexts/RequestContext';
import { StoryFn } from '@storybook/react/*';
import React from 'react';

const RequestDecorator = (Story: StoryFn): JSX.Element => (
  <RequestProvider>
    <Story />
  </RequestProvider>
);

export default RequestDecorator;
