import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { korvusBlackiron } from '../../../../test/stubs/Character.stubs';
import { isImage } from '../../../utils/image';
import CharacterImage from './CharacterImage';

jest.mock('../../../utils/image');

describe('CharacterImage', () => {
  const isImageMock = isImage as jest.MockedFunction<typeof isImage>;

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
      'unknown race unknown class',
    )) as HTMLImageElement;
    expect(image.src).toContain('/images/default-portrait.png');
  });
});
