import { Container, Paper } from '@mui/material';
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

  const children = characters.map((character) => (
    <CharacterSummary
      key={`${character.firstName}-${character.lastName}-${character.age}`}
      character={character}
      width={'300px'}
    />
  ));

  return (
    <Container maxWidth={false}>
      <Paper
        elevation={3}
        sx={{
          minHeight: '95vh',
          padding: '20px',
        }}
      >
        <PageTitle>My Characters</PageTitle>
        {characters.length > 0 && (
          <Carousel cardsPerPage={3} height={600}>
            {children}
          </Carousel>
        )}
      </Paper>
    </Container>
  );
};

export default Characters;
