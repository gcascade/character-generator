import type { Meta, StoryObj } from '@storybook/react';

import { DataContext } from '@Contexts/DataContext';
import DataDecorator from '@Test/decorators/DataDecorator';
import { characterList } from '@Test/stubs/Character.stubs';
import { Character } from '@Types/character';
import React, { FC, useContext, useEffect } from 'react';
import Characters from './Characters';

type PageProps = {
  characters: Character[];
};

const Page: FC<PageProps> = ({ characters }) => {
  const context = useContext(DataContext);

  useEffect(() => {
    characters.forEach((character) => {
      context?.saveCharacter(character);
    });
  }, []);

  return <Characters />;
};

const meta: Meta<PageProps> = {
  title: 'Pages/Characters',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [DataDecorator],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    characters: [],
  },
};

export const WithCharacters: Story = {
  args: {
    characters: characterList,
  },
};
