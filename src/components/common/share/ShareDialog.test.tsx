import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ShareDialog from './ShareDialog';

describe('ShareDialog', () => {
  it('shows the link and closes', async () => {
    const onClose = vi.fn();
    render(<ShareDialog url="https://x/share#c1.a" onClose={onClose} />);
    expect(screen.getByRole('textbox')).toHaveValue('https://x/share#c1.a');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('is hidden without a link', () => {
    render(<ShareDialog onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
