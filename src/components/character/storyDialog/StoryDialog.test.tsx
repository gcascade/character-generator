import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import StoryDialog from './StoryDialog';

const paragraphs = ['Born under the silver canopy.', 'Then came the fever.'];

describe('StoryDialog', () => {
  it('shows the whole story with its title', () => {
    render(
      <StoryDialog
        open
        onClose={vi.fn()}
        title="The Tale"
        subtitle="Elf Cleric"
        paragraphs={paragraphs}
      />,
    );
    expect(
      screen.getByRole('dialog', { name: 'The Tale' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Elf Cleric')).toBeInTheDocument();
    for (const paragraph of paragraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it('closes with the close button or Escape', async () => {
    const onClose = vi.fn();
    render(
      <StoryDialog open onClose={onClose} title="T" paragraphs={paragraphs} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when closed', () => {
    render(
      <StoryDialog open={false} onClose={vi.fn()} title="T" paragraphs={[]} />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
