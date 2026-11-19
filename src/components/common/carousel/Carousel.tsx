import { NavigateBefore as NavigateBeforeIcon } from '@mui/icons-material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Box, IconButton, Slide, Stack } from '@mui/material';

import React, { FC, useState } from 'react';
import { useT } from '../../../i18n';

type CarouselProps = {
  children: React.ReactElement[];
  cardsPerPage?: number;
  height?: number | string;
  /** Controlled page (optional), e.g. to come back to the same page. */
  page?: number;
  onPageChange?: (page: number) => void;
};

const Carousel: FC<CarouselProps> = ({
  children,
  cardsPerPage = 3,
  height,
  page: controlledPage,
  onPageChange,
}) => {
  const [internalPage, setInternalPage] = useState(controlledPage ?? 0);
  const currentPage = controlledPage ?? internalPage;
  const setCurrentPage = (next: number) => {
    setInternalPage(next);
    onPageChange?.(next);
  };
  const t = useT();
  const [slideDirection, setSlideDirection] = useState<
    'right' | 'left' | undefined
  >('left');

  const pageCount = Math.max(1, Math.ceil(children.length / cardsPerPage));
  // The number of cards per page can change with the screen size.
  const page = Math.min(currentPage, pageCount - 1);

  const handleNextPage = () => {
    setSlideDirection('left');
    setCurrentPage(Math.min(page + 1, pageCount - 1));
  };

  const handlePrevPage = () => {
    setSlideDirection('right');
    setCurrentPage(Math.max(page - 1, 0));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        height: height,
        width: '100%',
        marginTop: '40px',
      }}
      data-testid="carousel"
    >
      <IconButton
        onClick={handlePrevPage}
        sx={{ margin: { xs: 0, sm: 2 } }}
        disabled={page === 0}
        data-testid="navigate-before"
        aria-label={t('carousel.previous')}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <Box
        sx={{
          width: '100%',
          maxWidth: cardsPerPage * 330,
          minWidth: 0,
          height: '100%',
          display: 'flex',
        }}
      >
        {children.map((child, index) => (
          <Box
            key={`card-${index}`}
            sx={{
              width: '100%',
              height: '100%',
              display: page === index ? 'block' : 'none',
              flex: '0 0 auto',
            }}
          >
            <Slide direction={slideDirection} in={page === index}>
              <Stack
                spacing={2}
                direction="row"
                sx={{
                  width: '100%',
                  height: '100%',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.Children.toArray(children)
                  .slice(
                    index * cardsPerPage,
                    index * cardsPerPage + cardsPerPage,
                  )
                  .map((child, childIndex) => (
                    <Box
                      key={childIndex}
                      sx={{ height: height, flex: '0 0 auto' }}
                    >
                      {React.isValidElement(child) &&
                        React.cloneElement(child, {
                          height: height,
                        } as React.Attributes)}
                    </Box>
                  ))}
              </Stack>
            </Slide>
          </Box>
        ))}
      </Box>
      <IconButton
        onClick={handleNextPage}
        sx={{ margin: { xs: 0, sm: 2 } }}
        disabled={page >= pageCount - 1}
        data-testid="navigate-next"
        aria-label={t('carousel.next')}
      >
        <NavigateNextIcon />
      </IconButton>
    </Box>
  );
};

export default Carousel;
