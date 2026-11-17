import { Box } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import Carousel from './Carousel';

describe('Carousel Component', () => {
  const TestCard = ({ text }: { text: string }) => (
    <Box sx={{ width: 250, height: 400, backgroundColor: 'lightgray' }}>
      {text}
    </Box>
  );

  const renderCarousel = (cardsPerPage = 3) => {
    const children = Array.from({ length: 5 }, (_, i) => (
      <TestCard key={i} text={`Card ${i + 1}`} />
    ));
    return render(<Carousel cardsPerPage={cardsPerPage}>{children}</Carousel>);
  };

  test('renders the carousel component', () => {
    renderCarousel();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });

  test('disables the previous button on the first page', () => {
    renderCarousel();
    expect(screen.getByTestId('navigate-before')).toBeDisabled();
  });

  test('enables the next button when there are more pages', () => {
    renderCarousel();
    expect(screen.getByTestId('navigate-next')).toBeEnabled();
  });

  test('navigates to the next page on next button click', () => {
    renderCarousel();
    fireEvent.click(screen.getByTestId('navigate-next'));
    expect(screen.getByText('Card 4')).toBeInTheDocument();
  });

  test('disables the next button on the last page', () => {
    renderCarousel(2);
    const nextButton = screen.getByTestId('navigate-next');

    fireEvent.click(nextButton); // to page 2
    fireEvent.click(nextButton); // to page 3 (last page)

    expect(nextButton).toBeDisabled();
  });

  test('navigates to the previous page on previous button click', () => {
    renderCarousel();
    const nextButton = screen.getByTestId('navigate-next');
    const prevButton = screen.getByTestId('navigate-before');

    fireEvent.click(nextButton); // to page 2
    fireEvent.click(prevButton); // back to page 1

    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });
});

describe('Carousel when the number of cards per page changes', () => {
  const cards = Array.from({ length: 5 }, (_, i) => (
    <div key={i}>Card {i + 1}</div>
  ));

  it('stays on a valid page after switching to more cards per page', () => {
    const { rerender } = render(<Carousel cardsPerPage={1}>{cards}</Carousel>);
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByTestId('navigate-next'));
    }

    rerender(<Carousel cardsPerPage={3}>{cards}</Carousel>);

    expect(screen.getByText('Card 4')).toBeInTheDocument();
    expect(screen.getByTestId('navigate-next')).toBeDisabled();
    expect(screen.getByTestId('navigate-before')).toBeEnabled();
  });
});
