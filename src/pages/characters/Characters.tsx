import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router';
import CharacterSummary from '../../components/character/characterSummary/CharacterSummary';
import Carousel from '../../components/common/carousel/Carousel';
import PageTitle from '../../components/common/pageTitle/PageTitle';

import { DataContext } from '../../contexts/DataContext';
import { useT } from '../../i18n';

const Characters = () => {
  const context = useContext(DataContext);
  const t = useT();

  if (!context) {
    throw new Error('Characters must be used within a DataProvider');
  }

  const { characters } = context;

  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const cardsPerPage = isPhone ? 1 : isTablet ? 2 : 3;

  // The carousel page lives in this history entry, so coming back restores it (spec 006).
  const location = useLocation();
  const navigate = useNavigate();
  const page = (location.state as { page?: number } | null)?.page ?? 0;
  const setPage = (next: number) =>
    navigate('.', { replace: true, state: { page: next } });

  const children = characters.map((character, index) => (
    <CharacterSummary
      key={character.id ?? index}
      character={character}
      to={`/characters/${character.id}`}
      width={'min(300px, 100%)'}
    />
  ));

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ minHeight: '95vh', padding: { xs: 0.5, sm: 2 } }}>
        <PageTitle>{t('page.characters')}</PageTitle>
        {characters.length > 0 && (
          <Carousel
            cardsPerPage={cardsPerPage}
            height={600}
            page={page}
            onPageChange={setPage}
          >
            {children}
          </Carousel>
        )}
      </Box>
    </Container>
  );
};

export default Characters;
