import type { MockedFunction } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { korvusBlackiron } from '../../../../test/stubs/Character.stubs';
import { isImage } from '../../../utils/image';
import CharacterImage, { portraitFor } from './CharacterImage';

vi.mock('../../../utils/image');

describe('CharacterImage', () => {
  const isImageMock = isImage as MockedFunction<typeof isImage>;

  test('renders CharacterImage component without crashing', async () => {
    isImageMock.mockResolvedValue(true);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CharacterImage height={512} width={512} />);
    });
  });

  test("renders the correct image based on the character's properties", async () => {
    isImageMock.mockResolvedValue(true);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CharacterImage height={512} width={512} {...korvusBlackiron} />);
    });
    const image = (await screen.findByAltText(
      'Orc Warrior',
    )) as HTMLImageElement;
    expect(image.src).toContain('/images/orc/warrior/male1.png');
  });

  test("renders the default image when the character's image does not exist", async () => {
    isImageMock.mockResolvedValue(false);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CharacterImage height={512} width={512} />);
    });
    const image = (await screen.findByAltText(
      'Character portrait',
    )) as HTMLImageElement;
    expect(image.src).toContain('/images/default-portrait.png');
  });

  test('shows the race emblem when no portrait exists for the race and class (spec 009)', async () => {
    isImageMock.mockResolvedValue(false);
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterImage
          height={512}
          width={512}
          {...korvusBlackiron}
          race="Gnome"
          characterClass="Bard"
        />,
      );
    });
    expect(
      await screen.findByRole('img', { name: 'Emblem: Gnome Bard' }),
    ).toBeInTheDocument();
    expect(screen.queryByAltText('Gnome Bard')).not.toBeInTheDocument();
  });
});

describe('portraitFor', () => {
  it('uses file-friendly folder names', () => {
    expect(portraitFor('Dark elf', 'Ranger', 'Female')).toContain(
      '/images/dark-elf/ranger/female1.png',
    );
  });

  it('always gives the same portrait to the same non-binary character', () => {
    const paths = new Set(
      Array.from({ length: 20 }, () =>
        portraitFor('Elf', 'Mage', 'Non-binary', 'Lathlaer Riverglen'),
      ),
    );
    expect(paths.size).toBe(1);
  });

  it('uses both portraits across non-binary characters', () => {
    const variants = new Set(
      ['Ash', 'Brin', 'Cael', 'Dara', 'Eli', 'Fen'].map(
        (name) =>
          portraitFor('Human', 'Rogue', 'Non-binary', name).match(
            /\/(male|female)1\.png$/,
          )![1],
      ),
    );
    expect(variants).toEqual(new Set(['male', 'female']));
  });

  it('follows the gender of other characters', () => {
    expect(portraitFor('Dwarf', 'Cleric', 'Female', 'x')).toMatch(
      /dwarf\/cleric\/female1\.png$/,
    );
  });
});
