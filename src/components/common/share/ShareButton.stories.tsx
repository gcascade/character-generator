import { Meta, StoryObj } from '@storybook/react-vite';
import AlertManagerDecorator from '@Test/decorators/AlertManagerDecorator';
import ShareButton from './ShareButton';

const meta = {
  title: 'Common/ShareButton',
  component: ShareButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [AlertManagerDecorator],
  args: {
    label: 'Share',
    target: () => ({
      title: 'Korvus Blackiron',
      url: 'https://gcascade.github.io/character-generator/share#c1.example',
      copied: 'share.copied',
    }),
  },
} satisfies Meta<typeof ShareButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { variant: 'text' } };
export const Icon: Story = { args: { variant: 'icon' } };
