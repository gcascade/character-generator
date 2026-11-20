import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RoleMenu from './RoleMenu';

const meta = {
  title: 'Party/RoleMenu',
  component: RoleMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { role: 'role-leader', gender: 'Female', name: 'Edith' },
} satisfies Meta<typeof RoleMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editable: Story = { args: { onChange: fn() } };
export const ReadOnly: Story = {};
