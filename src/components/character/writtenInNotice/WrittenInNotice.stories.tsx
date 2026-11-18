import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import WrittenInNotice from './WrittenInNotice';

const meta = {
  title: 'Character/WrittenInNotice',
  component: WrittenInNotice,
  tags: ['autodocs'],
  args: { language: 'fr', by: 'ai' },
} satisfies Meta<typeof WrittenInNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WrittenByAi: Story = {};

export const WithTranslation: Story = { args: { onTranslate: fn() } };

export const Legacy: Story = { args: { language: 'en', by: 'legacy' } };
