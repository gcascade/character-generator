import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

vi.mock('../pages/home/Home', () => ({
  default: () => <div>CharacterGenerator</div>,
}));

describe('App', () => {
  afterEach(() => localStorage.clear());

  test('renders App component without crashing', () => {
    render(<App />);
    const characterGeneratorElement = screen.getByText('CharacterGenerator');
    expect(characterGeneratorElement).toBeInTheDocument();
  });

  test('opens in the remembered language', () => {
    localStorage.setItem('locale', 'fr');
    render(<App />);
    // jsdom has no media queries: the app shows its phone layout.
    expect(
      screen.getByRole('button', { name: 'Ouvrir le menu' }),
    ).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('fr');
  });
});
