import { Meta, StoryObj } from '@storybook/react-vite';
import PaintedImage from './PaintedImage';

// A small painted-looking gradient, so the story needs no network.
const IMAGE =
  'data:image/svg+xml;base64,' +
  btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="384" height="384"><defs><radialGradient id="g"><stop offset="0" stop-color="#e0b567"/><stop offset="1" stop-color="#3a2717"/></radialGradient></defs><rect width="384" height="384" fill="url(#g)"/></svg>',
  );

const meta = {
  title: 'Portrait/PaintedImage',
  component: PaintedImage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    image: IMAGE,
    alt: 'Gnome Bard',
    height: 290,
    width: 220,
    crop: true,
  },
} satisfies Meta<typeof PaintedImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Painted: Story = {};

export const Outdated: Story = { args: { outdated: true } };
