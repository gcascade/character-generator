import type { StorybookConfig } from '@storybook/react-webpack5';

const path = require('path');

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    config.resolve.alias['@Test'] = path.resolve(__dirname, '../test');
    config.resolve.alias['@Contexts'] = path.resolve(
      __dirname,
      '../src/contexts',
    );
    config.resolve.alias['@Types'] = path.resolve(__dirname, '../src/types');
    return config;
  },
};
export default config;
