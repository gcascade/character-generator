import { LocaleProvider } from '@I18n/index';
import type { Decorator } from '@storybook/react-vite';
import React from 'react';

const LocaleDecorator: Decorator = (Story) => (
  <LocaleProvider>
    <Story />
  </LocaleProvider>
);

export default LocaleDecorator;
