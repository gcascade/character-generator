import type { Preview } from '@storybook/react-vite';

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
