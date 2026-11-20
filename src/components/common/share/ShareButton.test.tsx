import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AlertManagerProvider } from '../../../contexts/AlertManagerContext';
import ShareButton from './ShareButton';

const target = () => ({
  title: 'T',
  url: 'https://x/share#c1.abc',
  copied: 'share.copied' as const,
});

const renderButton = (variant: 'icon' | 'text') =>
  render(
    <AlertManagerProvider>
      <ShareButton label="Share" target={target} variant={variant} />
    </AlertManagerProvider>,
  );

describe('ShareButton', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each(['icon', 'text'] as const)('shares as %s', async (variant) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    renderButton(variant);
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(writeText).toHaveBeenCalledWith('https://x/share#c1.abc');
  });

  it('shows the link to copy by hand when the clipboard is blocked', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('no')) },
    });
    renderButton('text');
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(screen.getByRole('textbox', { name: 'Copy this link' })).toHaveValue(
      'https://x/share#c1.abc',
    );
  });
});
