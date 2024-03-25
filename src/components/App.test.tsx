import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

jest.mock('./CharacterGenerator', () => () => <div>CharacterGenerator</div>);

describe('App', () => {
  test('renders App component without crashing', () => {
    render(<App />);
    const characterGeneratorElement = screen.getByText('CharacterGenerator');
    expect(characterGeneratorElement).toBeInTheDocument();
  });
});
