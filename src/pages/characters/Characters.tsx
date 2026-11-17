import { Container, Paper, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import CharacterSummary from '../../components/character/characterSummary/CharacterSummary';
import Carousel from '../../components/common/carousel/Carousel';
import PageTitle from '../../components/common/pageTitle/PageTitle';

import { DataContext } from '../../contexts/DataContext';

const Characters = () => {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('Characters must be used within a DataProvider');
  }

  const { characters } = context;

  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const cardsPerPage = isPhone ? 1 : isTablet ? 2 : 3;

  const children = characters.map((character) => (
    <CharacterSummary
      key={`${character.firstName}-${character.lastName}-${character.age}`}
      character={character}
      width={'min(300px, 100%)'}
    />
  ));

  return (
    <Container maxWidth={false} disableGutters>
      <Paper
        elevation={3}
        sx={{
          minHeight: '95vh',
          padding: { xs: 1.5, sm: 2.5 },
        }}
      >
        <PageTitle>My Characters</PageTitle>
        {characters.length > 0 && (
          <Carousel cardsPerPage={cardsPerPage} height={600}>
            {children}
          </Carousel>
        )}
      </Paper>
    </Container>
  );
};

export default Characters;
