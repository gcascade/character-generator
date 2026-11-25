import { Close as RemoveIcon } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { label } from '../../../content/labels';
import { useLocale, useT } from '../../../i18n';
import type { Contestant, Skills } from '../../../types/arena';
import CharacterImage from '../../character/characterImage/CharacterImage';
import SkillGrid from '../skillGrid/SkillGrid';

type ContestantCardProps = {
  contestant: Contestant;
  skills: Skills;
  onRemove?: VoidFunction;
  /** Perk and item pickers (spec 012 US4). */
  children?: ReactNode;
};

/** A contestant in the roster: portrait, name, race, class and skills for this match. */
const ContestantCard: FC<ContestantCardProps> = ({
  contestant,
  skills,
  onRemove,
  children,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const { character } = contestant;
  const name = `${character.firstName} ${character.lastName}`.trim();

  return (
    <Card component="article" aria-label={name} sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, p: 2, pb: 0, alignItems: 'center' }}>
        <CharacterImage
          race={character.race}
          characterClass={character.characterClass}
          gender={character.gender}
          firstName={character.firstName}
          lastName={character.lastName}
          portraitId={character.portraitId}
          age={character.age}
          height={72}
          width={72}
          crop
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ overflowWrap: 'anywhere', lineHeight: 1.3 }}
          >
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {label('race', character.race, character.gender, locale)} ·{' '}
            {label('class', character.characterClass, character.gender, locale)}
          </Typography>
        </Box>
        {onRemove && (
          <IconButton
            aria-label={t('arena.remove', { name })}
            onClick={onRemove}
            size="small"
          >
            <RemoveIcon />
          </IconButton>
        )}
      </Box>
      <CardContent>
        <SkillGrid skills={skills} name={name} />
        {children}
      </CardContent>
    </Card>
  );
};

export default ContestantCard;
