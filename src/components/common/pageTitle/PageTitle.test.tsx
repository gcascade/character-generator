import { render, screen } from '@testing-library/react';
import PageTitle from './PageTitle';

describe('PageTitle', () => {
  it('renders children', () => {
    render(<PageTitle>My Title</PageTitle>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });
});
