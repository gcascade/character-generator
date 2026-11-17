import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ApiKeyField from './ApiKeyField';

const setup = (
  props: Partial<React.ComponentProps<typeof ApiKeyField>> = {},
) => {
  const handlers = {
    onChange: vi.fn(),
    onRememberChange: vi.fn(),
    onForget: vi.fn(),
  };
  render(
    <ApiKeyField
      providerName="Claude"
      value=""
      remember
      hasStoredKey
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe('ApiKeyField', () => {
  it('states where the key is stored and sent', () => {
    setup();
    expect(
      screen.getByText(
        'Your key is stored only in this browser and sent only to Claude.',
      ),
    ).toBeInTheDocument();
  });

  it('hides the typed key', () => {
    setup({ value: 'sk-1' });
    expect(screen.getByLabelText('API key')).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('reports typing, the remember choice and the forget action', async () => {
    const handlers = setup();
    await userEvent.type(screen.getByLabelText('API key'), 'k');
    expect(handlers.onChange).toHaveBeenCalledWith('k');

    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Remember on this device' }),
    );
    expect(handlers.onRememberChange).toHaveBeenCalledWith(false);

    await userEvent.click(screen.getByRole('button', { name: 'Forget key' }));
    expect(handlers.onForget).toHaveBeenCalled();
  });

  it('disables "Forget key" when no key is stored', () => {
    setup({ hasStoredKey: false });
    expect(screen.getByRole('button', { name: 'Forget key' })).toBeDisabled();
  });

  it('warns that a session-only key disappears with the tab', () => {
    setup({ remember: false });
    expect(
      screen.getByText('The key will be deleted when you close this tab.'),
    ).toBeInTheDocument();
  });

  it('shows a validation error instead of the notice', () => {
    setup({ error: 'Enter your API key' });
    expect(screen.getByText('Enter your API key')).toBeInTheDocument();
  });
});
