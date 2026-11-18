import type { Preview } from '@storybook/react-vite';
import LocaleDecorator from '../test/decorators/LocaleDecorator';

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
  // Every component may read texts through useT().
  decorators: [LocaleDecorator],
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
