import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, Slide, Stack } from '@mui/material';

import React, { FC, useState } from 'react';

type CarouselProps = {
  children: React.ReactNode[];
  cardsPerPage?: number;
};

const Carousel: FC<CarouselProps> = ({ children, cardsPerPage = 3 }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<
    'right' | 'left' | undefined
  >('left');

  const containerWidth = cardsPerPage * 250;

  const handleNextPage = () => {
    setSlideDirection('left');
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setSlideDirection('right');
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        height: '400px',
        width: '100%',
        marginTop: '40px',
      }}
      data-testid="carousel"
    >
      <IconButton
        onClick={handlePrevPage}
        sx={{ margin: 15 }}
        disabled={currentPage === 0}
        data-testid="navigate-before"
      >
        <NavigateBeforeIcon />
      </IconButton>
      <Box
        sx={{
          width: `${containerWidth}px`,
          height: '100%',
          display: 'flex',
          paddingLeft: '50px',
          paddingRight: '50px',
        }}
      >
        {children.map((child, index) => (
          <Box
            key={`card-${index}`}
            sx={{
              width: '100%',
              height: '100%',
              display: currentPage === index ? 'block' : 'none',
              flex: '0 0 auto',
            }}
          >
            <Slide direction={slideDirection} in={currentPage === index}>
              <Stack
                spacing={2}
                direction="row"
                alignContent="center"
                justifyContent="center"
                sx={{ width: '100%', height: '100%' }}
              >
                {React.Children.toArray(children)
                  .slice(
                    index * cardsPerPage,
                    index * cardsPerPage + cardsPerPage,
                  )
                  .map((child, childIndex) => (
                    <Box
                      key={childIndex}
                      sx={{ height: '100%', flex: '0 0 auto' }}
                    >
                      {child}
                    </Box>
                  ))}
              </Stack>
            </Slide>
          </Box>
        ))}
      </Box>
      <IconButton
        onClick={handleNextPage}
        sx={{
          margin: 15,
        }}
        disabled={
          currentPage >= Math.ceil((children.length || 0) / cardsPerPage) - 1
        }
        data-testid="navigate-next"
      >
        <NavigateNextIcon />
      </IconButton>
    </Box>
  );
};

export default Carousel;
