import { Box } from '@mui/material';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import Carousel from './Carousel';

describe('Carousel Component', () => {
  const TestCard = ({ text }) => (
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
    const { getByTestId } = renderCarousel();
    expect(getByTestId('carousel')).toBeInTheDocument();
  });

  test('disables the previous button on the first page', () => {
    const { getByTestId } = renderCarousel();
    expect(getByTestId('navigate-before')).toBeDisabled();
  });

  test('enables the next button when there are more pages', () => {
    const { getByTestId } = renderCarousel();
    expect(getByTestId('navigate-next')).toBeEnabled();
  });

  test('navigates to the next page on next button click', () => {
    const { getByTestId, getByText } = renderCarousel();
    fireEvent.click(getByTestId('navigate-next'));
    expect(getByText('Card 4')).toBeInTheDocument();
  });

  test('disables the next button on the last page', () => {
    const { getByTestId } = renderCarousel(2);
    const nextButton = getByTestId('navigate-next');

    fireEvent.click(nextButton); // to page 2
    fireEvent.click(nextButton); // to page 3 (last page)

    expect(nextButton).toBeDisabled();
  });

  test('navigates to the previous page on previous button click', () => {
    const { getByText, getByTestId } = renderCarousel();
    const nextButton = getByTestId('navigate-next');
    const prevButton = getByTestId('navigate-before');

    fireEvent.click(nextButton); // to page 2
    fireEvent.click(prevButton); // back to page 1

    expect(getByText('Card 1')).toBeInTheDocument();
  });
});
