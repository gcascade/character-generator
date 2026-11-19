import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { generateRandomCharacter } from '../../../content/generate';
import { renderCharacter } from '../../../content/character';
import CharacterDetail from './CharacterDetail';

describe('CharacterDetail', () => {
  it('shows every property and every story paragraph', () => {
    render(<CharacterDetail character={korvusBlackiron} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Korvus Blackiron' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: korvusBlackiron.background!.title,
      }),
    ).toBeInTheDocument();
    for (const paragraph of korvusBlackiron.background!.content) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByText('Lawful Good')).toBeInTheDocument();
  });

  it('shows the four paragraphs of app content', () => {
    const character = generateRandomCharacter();
    render(<CharacterDetail character={character} />);
    const { content } = renderCharacter(character, 'en').background;
    expect(content).toHaveLength(4);
    for (const paragraph of content) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
  });

  it('shows only the actions it is given', () => {
    render(<CharacterDetail character={korvusBlackiron} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('runs its actions, asking before deleting', async () => {
    const onBack = vi.fn();
    const onOpen = vi.fn();
    const onDelete = vi.fn();
    render(
      <CharacterDetail
        character={korvusBlackiron}
        onBack={onBack}
        onOpenInGenerator={onOpen}
        onDelete={onDelete}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to my characters' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Open in the generator' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Click again to delete' }),
    );
    expect([onBack, onOpen, onDelete].map((f) => f.mock.calls.length)).toEqual([
      1, 1, 1,
    ]);
  });
});
