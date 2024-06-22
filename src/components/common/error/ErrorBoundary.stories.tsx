import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import React, { FC, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';

type ErrorProneComponentProps = {
  throwError: boolean;
};

const ErrorProneComponent: FC<ErrorProneComponentProps> = ({ throwError }) => {
  if (throwError) {
    throw new Error('This error was thrown by clicking the button.');
  }

  return (
    <div>
      <h1>This component works fine</h1>
    </div>
  );
};

const DemoComponent: FC = () => {
  const [throwError, setThrowError] = useState(false);

  const onClick = () => {
    setThrowError(!throwError);
  };

  return (
    <>
      <Button variant="contained" onClick={onClick}>
        Click me to throw an error
      </Button>
      <ErrorBoundary>
        <ErrorProneComponent throwError={throwError} />
      </ErrorBoundary>
    </>
  );
};

const meta: Meta = {
  title: 'Common/Error/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DemoComponent />,
};
