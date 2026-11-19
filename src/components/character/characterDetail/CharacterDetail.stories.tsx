import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { generateRandomCharacter } from '../../../content/generate';
import CharacterDetail from './CharacterDetail';

const meta = {
  title: 'Character/CharacterDetail',
  component: CharacterDetail,
  tags: ['autodocs'],
  args: { onBack: fn(), onOpenInGenerator: fn(), onDelete: fn() },
} satisfies Meta<typeof CharacterDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AppContent: Story = {
  args: {
    character: generateRandomCharacter({ race: 'Elf', characterClass: 'Mage' }),
  },
};

export const LegacyText: Story = { args: { character: korvusBlackiron } };

export const AiTextInFrench: Story = {
  args: {
    character: {
      ...korvusBlackiron,
      epithet: "l'Inflexible",
      textLanguage: 'fr',
      textSource: 'ai',
    },
    onTranslate: fn(),
  },
};

export const ReadOnly: Story = {
  args: {
    character: korvusBlackiron,
    onBack: undefined,
    onOpenInGenerator: undefined,
    onDelete: undefined,
  },
};
