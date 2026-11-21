import { PAINTED_IMAGE } from '@Test/stubs/horde';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PaintedImage from './PaintedImage';

describe('PaintedImage (spec 011)', () => {
  it('shows the painted image', () => {
    render(
      <PaintedImage
        image={PAINTED_IMAGE}
        alt="Gnome Bard"
        height={200}
        width={200}
      />,
    );
    expect(screen.getByAltText('Gnome Bard')).toHaveAttribute(
      'src',
      PAINTED_IMAGE,
    );
    expect(screen.queryByText('May be outdated')).not.toBeInTheDocument();
  });

  it('says when the character changed since painting', () => {
    render(
      <PaintedImage
        image={PAINTED_IMAGE}
        alt="Gnome Bard"
        height={200}
        width={200}
        outdated
      />,
    );
    expect(screen.getByText('May be outdated')).toBeInTheDocument();
  });
});
