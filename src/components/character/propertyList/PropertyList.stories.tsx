import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import PropertyList from './PropertyList';

const meta = {
  title: 'Character/PropertyList',
  component: PropertyList,
  tags: ['autodocs'],
} satisfies Meta<typeof PropertyList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { character: korvusBlackiron } };
