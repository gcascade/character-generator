import { render, screen } from '@testing-library/react';
import React from 'react';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { korvusBlackiron } from '../../../../test/stubs/Character.stubs';
import portraitFiles from '../../../data/content/portraitFiles.json';
import CharacterImage, { portraitFor } from './CharacterImage';

describe('CharacterImage', () => {
  test('shows the generic portrait without a character', () => {
    render(<CharacterImage height={512} width={512} />);
    expect(
      (screen.getByAltText('Character portrait') as HTMLImageElement).src,
    ).toContain('/images/default-portrait.png');
  });

  test("shows the portrait file of the character's race, class and gender", () => {
    render(<CharacterImage height={512} width={512} {...korvusBlackiron} />);
    expect(
      (screen.getByAltText('Orc Warrior') as HTMLImageElement).src,
    ).toContain('/images/orc/warrior/male1.png');
  });

  test('shows the race emblem when no portrait exists for the race and class (spec 009)', () => {
    render(
      <CharacterImage
        height={512}
        width={512}
        {...korvusBlackiron}
        race="Gnome"
        characterClass="Bard"
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Emblem: Gnome Bard' }),
    ).toBeInTheDocument();
    expect(screen.queryByAltText('Gnome Bard')).not.toBeInTheDocument();
  });
});

describe('portraitFor', () => {
  it('lists exactly the portrait files in public/images (spec 011 R5)', () => {
    const images = join(__dirname, '../../../../public/images');
    const files = readdirSync(images, { recursive: true, encoding: 'utf8' })
      .map((file) => file.replaceAll('\\', '/'))
      .filter((file) =>
        /^[a-z-]+\/[a-z-]+\/(male|female)1\.(png|webp|jpg)$/.test(file),
      )
      .sort();
    expect(portraitFiles).toEqual(files);
  });

  it('uses file-friendly folder names and the listed extension', () => {
    expect(portraitFor('Elf', 'Mage', 'Female')).toMatch(
      /\/images\/elf\/mage\/female1\.png$/,
    );
    expect(portraitFor('Dark elf', 'Ranger', 'Female')).toBeUndefined();
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
          portraitFor('Human', 'Rogue', 'Non-binary', name)!.match(
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
