import type { Preview } from '@storybook/react-vite';
import LocaleDecorator from '../test/decorators/LocaleDecorator';
import ThemeDecorator from '../test/decorators/ThemeDecorator';

const localStorageMock = (() => {
  return {
    getItem: () => {},
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const preview: Preview = {
  // Every component may read texts through useT() and uses the app theme.
  decorators: [LocaleDecorator, ThemeDecorator],
  globalTypes: {
    mode: {
      description: 'Colour mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { mode: 'light' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
