import RouterDecorator from '@Test/decorators/RouterDecorator';
import { Meta, StoryObj } from '@storybook/react';
import DrawerMenu from './DrawerMenu';

const meta = {
  title: 'Navigation/DrawerMenu',
  component: DrawerMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [RouterDecorator],
  argTypes: {
    width: {
      description: 'Width of the drawer menu',
      control: 'number',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 300,
  },
};
