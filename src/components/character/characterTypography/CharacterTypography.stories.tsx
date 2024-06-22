import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import CharacterTypography from './CharacterTypography';

type CharacterTypographyProps = React.ComponentProps<
  typeof CharacterTypography
> & {
  label: string;
};

const meta: Meta<CharacterTypographyProps> = {
  title: 'Character/CharacterTypography',
  component: CharacterTypography,
  parameters: {
    layout: 'centered',
  },
  render: function RenderStory(args) {
    return <CharacterTypography {...args}>{args.label}</CharacterTypography>;
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Text to display',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Lorem Ipsum',
  },
};
