import CharacterDecorator from '@Test/decorators/CharacterDecorator';
import {
  longBackgroundStub,
  shortBackgroundStub,
} from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react';
import CharacterBackground from './CharacterBackground';

const meta = {
  title: 'Character/CharacterBackground',
  component: CharacterBackground,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the character background',
    },
    content: {
      description:
        'The content of the character background. 1 string = 1 paragraph',
    },
  },
  decorators: [CharacterDecorator],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LongContent: Story = {
  args: longBackgroundStub,
};

export const ShortContent: Story = {
  args: shortBackgroundStub,
};
