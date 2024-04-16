import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import RerollButton from './RerollButton';

describe('RerollButton', () => {
  const handleClick = jest.fn();

  it('renders without crashing', () => {
    const { getByRole } = render(
      <RerollButton tooltip="Test Tooltip" onButtonClick={handleClick} />,
    );
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct tooltip', async () => {
    const baseDom = render(
      <RerollButton tooltip="Test Tooltip" onButtonClick={handleClick} />,
    );

    fireEvent.mouseOver(baseDom.getByTestId('reroll-button'));

    expect(await baseDom.findByText('Test Tooltip')).toBeInTheDocument();
  });

  it('calls onButtonClick when clicked', () => {
    const { getByRole } = render(
      <RerollButton tooltip="Test Tooltip" onButtonClick={handleClick} />,
    );
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
