import { render } from '@testing-library/react';
import React from 'react';
import {
  ClercIcon,
  DwarfIcon,
  ElfIcon,
  HumanIcon,
  MageIcon,
  OrcIcon,
  RogueIcon,
  WarriorIcon,
} from './Icons';

describe('Icons', () => {
  it('renders ElfIcon without crashing', () => {
    const { container } = render(<ElfIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders DwarfIcon without crashing', () => {
    const { container } = render(<DwarfIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders HumanIcon without crashing', () => {
    const { container } = render(<HumanIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders OrcIcon without crashing', () => {
    const { container } = render(<OrcIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders WarriorIcon without crashing', () => {
    const { container } = render(<WarriorIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders MageIcon without crashing', () => {
    const { container } = render(<MageIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders RogueIcon without crashing', () => {
    const { container } = render(<RogueIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders ClercIcon without crashing', () => {
    const { container } = render(<ClercIcon />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
