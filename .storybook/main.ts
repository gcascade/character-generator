import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-links'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  // Storybook copies public/ itself (staticDirs); Vite copying it too races on CI (EEXIST).
  viteFinal: (viteConfig) => ({ ...viteConfig, base: './', publicDir: false }),
};

export default config;
