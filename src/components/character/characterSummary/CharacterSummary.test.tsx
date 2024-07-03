import { render, screen } from '@testing-library/react';
import React from 'react';
import { eryndorThorne } from '../../../../test/stubs/Character.stubs';
import CharacterSummary from './CharacterSummary';

describe('CharacterSummary', () => {
  it('renders without crashing', () => {
    render(<CharacterSummary character={eryndorThorne} />);
    expect(screen.getByText(/Eryndor Thorne/)).toBeInTheDocument();
    expect(screen.getByText(/The Unyielding/)).toBeInTheDocument();
    expect(screen.getByText(/Human/)).toBeInTheDocument();
    expect(screen.getByText(/Warrior/)).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/53/)).toBeInTheDocument();
    expect(screen.getByText(/Lawful Good/)).toBeInTheDocument();
  });
});
