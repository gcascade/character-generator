import { StoryFn } from '@storybook/react/*';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const RouterDecorator = (Story: StoryFn): JSX.Element => (
  <MemoryRouter initialEntries={['/']} initialIndex={0}>
    <Story />
  </MemoryRouter>
);

export default RouterDecorator;
