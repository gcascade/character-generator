import { render, screen } from '@testing-library/react';
import React from 'react';
import { GenderIcon } from './GenderIcon';

describe('GenderIcon', () => {
  it('renders the male icon when gender prop is "Male"', () => {
    render(<GenderIcon gender="Male" />);
    const maleIcon = screen.getByTestId('male-icon');
    expect(maleIcon).toBeInTheDocument();
  });

  it('renders the female icon when gender prop is "Female"', () => {
    render(<GenderIcon gender="Female" />);
    const femaleIcon = screen.getByTestId('female-icon');
    expect(femaleIcon).toBeInTheDocument();
  });

  it('renders the non-binary icon when gender prop is "Non-binary"', () => {
    render(<GenderIcon gender="Non-binary" />);
    const nonBinaryIcon = screen.getByTestId('non-binary-icon');
    expect(nonBinaryIcon).toBeInTheDocument();
  });
});
