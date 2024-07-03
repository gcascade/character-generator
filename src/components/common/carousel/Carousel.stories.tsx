import type { Meta, StoryObj } from '@storybook/react';

import React, { FC } from 'react';
import Carousel from './Carousel';

type ComponentProps = {
  cardsPerPage: number;
};

const Component: FC<ComponentProps> = ({ cardsPerPage }) => {
  const children = [
    <span key="1">Card 1</span>,
    <span key="2">Card 2</span>,
    <span key="3">Card 3</span>,
    <span key="4">Card 4</span>,
    <span key="5">Card 5</span>,
    <span key="6">Card 6</span>,
    <span key="7">Card 7</span>,
    <span key="8">Card 8</span>,
    <span key="9">Card 9</span>,
    <span key="10">Card 10</span>,
  ];

  return <Carousel cardsPerPage={cardsPerPage}>{children}</Carousel>;
};

const meta: Meta<ComponentProps> = {
  title: 'Common/Carousel/Carousel',
  component: Component,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<ComponentProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cardsPerPage: 3,
  },
};
