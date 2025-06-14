import type { Meta, StoryObj } from '@storybook/react';

import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import DataDecorator from '@Test/decorators/DataDecorator';
import HistoryDecorator from '@Test/decorators/HistoryDecorator';
import RequestDecorator from '@Test/decorators/RequestDecorator';
import SettingsDecorator from '@Test/decorators/SettingsDecorator';
import Home from './Home';

const meta = {
  title: 'Pages/Home',
  component: Home,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    HistoryDecorator,
    CharacterDecorator,
    AlertManagerDecorator,
    RequestDecorator,
    SettingsDecorator,
    DataDecorator,
  ],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
