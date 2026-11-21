import { render, screen } from '@testing-library/react';
import React from 'react';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { korvusBlackiron } from '../../../../test/stubs/Character.stubs';
import CharacterImage, { portraitFor } from './CharacterImage';

// A fixed list, so the tests do not depend on which portraits exist (spec 011 R5).
vi.mock('../../../data/content/portraitFiles.json', () => ({
  default: [
    'dwarf/cleric/female1.png',
    'elf/mage/female1.png',
    'elf/mage/male1.png',
    'human/rogue/female1.png',
    'human/rogue/male1.png',
    'orc/warrior/male1.png',
  ],
}));

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
    const portraitFiles = JSON.parse(
      readFileSync(
        join(__dirname, '../../../data/content/portraitFiles.json'),
        'utf8',
      ),
    );
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
