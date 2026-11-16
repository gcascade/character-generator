import type { Decorator } from '@storybook/react-vite';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const RouterDecorator: Decorator = (Story) => (
  <MemoryRouter initialEntries={['/']} initialIndex={0}>
    <Story />
  </MemoryRouter>
);

export default RouterDecorator;
