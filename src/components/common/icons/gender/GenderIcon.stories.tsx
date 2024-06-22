import { Meta, StoryObj } from '@storybook/react';
import { Genders } from '../../../../types/character';
import { GenderIcon } from './GenderIcon';

const meta = {
  title: 'Common/Icons/GenderIcon',
  component: GenderIcon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    gender: {
      description: 'Gender to display',
      control: {
        type: 'select',
        options: Object.values(Genders),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Female: Story = {
  args: {
    gender: 'Female',
  },
};

export const Male: Story = {
  args: {
    gender: 'Male',
  },
};

export const NonBinary: Story = {
  args: {
    gender: 'Non-binary',
  },
};
