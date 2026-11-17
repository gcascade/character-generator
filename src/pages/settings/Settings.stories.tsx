import type { Meta, StoryObj } from '@storybook/react-vite';

import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import SettingsDecorator from '@Test/decorators/SettingsDecorator';
import Settings from './Settings';

const meta = {
  title: 'Pages/Settings',
  component: Settings,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [SettingsDecorator, AlertManagerDecorator],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
