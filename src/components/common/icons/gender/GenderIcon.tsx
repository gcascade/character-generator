import { Female, Male, Transgender } from '@mui/icons-material';
import React, { FC } from 'react';
import { Gender } from '../../../../types/character';
import './GenderIcon.css';

type GenderIconsProps = {
  gender: Gender;
};

export const GenderIcon: FC<GenderIconsProps> = ({ gender }) => {
  const className = `gender-icon ${gender?.toLowerCase()}`;

  switch (gender) {
    case 'Male':
      return <Male className={className} data-testid="male-icon" />;
    case 'Female':
      return <Female className={className} data-testid="female-icon" />;
    case 'Non-binary':
      return (
        <Transgender className={className} data-testid="non-binary-icon" />
      );
  }
};
