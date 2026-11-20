import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { label } from '../../../content/labels';
import { renderNpc } from '../../../content/npc';
import { type MessageKey, useLocale, useT } from '../../../i18n';
import { raceToken } from '../../../themes/palette';
import {
  type LockableNpcProperty,
  NPC_SECTIONS,
  type Npc,
  type NpcSection,
} from '../../../types/npc';
import RerollButton from '../../common/buttons/RerollButton';
import CharacterProperty from '../../character/characterProperty/CharacterProperty';
import RaceEmblem from '../../character/raceEmblem/RaceEmblem';
import WrittenInNotice from '../../character/writtenInNotice/WrittenInNotice';

const FIELDS: { property: LockableNpcProperty; label: MessageKey }[] = [
  { property: 'firstName', label: 'field.firstName' },
  { property: 'lastName', label: 'field.lastName' },
  { property: 'occupation', label: 'field.occupation' },
  { property: 'race', label: 'field.race' },
  { property: 'gender', label: 'field.gender' },
  { property: 'age', label: 'field.age' },
];

export type NpcSheetActions = {
  onReroll: (target: LockableNpcProperty | NpcSection) => void;
  isLocked: (property: LockableNpcProperty) => boolean;
  onToggleLock: (property: LockableNpcProperty) => void;
  disabled?: boolean;
};

type NpcSheetProps = {
  npc: Npc;
  /** Dice and padlocks; the sheet is read-only without them. */
  actions?: NpcSheetActions;
  /** Buttons under the sheet (save, share, delete…). */
  footer?: React.ReactNode;
  headingLevel?: 'h1' | 'h2';
};

/** A side character for the game master: who they are and six short sections (spec 010). */
const NpcSheet: FC<NpcSheetProps> = ({
  npc,
  actions,
  footer,
  headingLevel = 'h2',
}) => {
  const t = useT();
  const { locale } = useLocale();
  const sheet = renderNpc(npc, locale);
  const { firstName, lastName, race, gender, age, occupation } = npc;

  const display = (property: LockableNpcProperty): string | number => {
    switch (property) {
      case 'race':
        return label('race', race, gender, locale);
      case 'gender':
        return label('gender', gender, gender, locale);
      case 'occupation':
        return label('occupation', occupation, gender, locale);
      default:
        return npc[property];
    }
  };

  return (
    <Card component="article" aria-label={`${firstName} ${lastName}`}>
      <CardContent
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: 220, md: 'none' },
            mx: { xs: 'auto', md: 0 },
            width: '100%',
          }}
        >
          <RaceEmblem
            race={race}
            occupation={occupation}
            gender={gender}
            height={260}
            width="100%"
          />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            component={headingLevel}
            sx={{ overflowWrap: 'anywhere', lineHeight: 1.2, mb: 1 }}
          >
            {firstName} {lastName}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={label('occupation', occupation, gender, locale)}
              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
            />
            <Chip
              label={label('race', race, gender, locale)}
              sx={{ bgcolor: raceToken(race), color: 'badgeText.main' }}
            />
            <Chip
              variant="outlined"
              label={`${label('gender', gender, gender, locale)} · ${t('character.age', { age })}`}
              sx={{
                color: 'text.secondary',
                '& .MuiChip-label': { fontWeight: 500 },
              }}
            />
          </Box>
          {actions && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                columnGap: 2,
                rowGap: 0.25,
                mb: 2,
              }}
            >
              {FIELDS.map((field) => {
                const locked = actions.isLocked(field.property);
                return (
                  <CharacterProperty
                    key={field.property}
                    label={t(field.label)}
                    value={display(field.property)}
                    tooltip={t(`reroll.${field.property}`)}
                    onButtonClick={() => actions.onReroll(field.property)}
                    isRerollButtonDisabled={actions.disabled}
                    locked={locked}
                    onToggleLock={() => actions.onToggleLock(field.property)}
                    lockLabel={t(
                      `${locked ? 'unlock' : 'lock'}.${field.property}`,
                    )}
                  />
                );
              })}
            </Box>
          )}
          {sheet.writtenByAi && (
            <WrittenInNotice language={sheet.writtenIn ?? locale} by="ai" />
          )}
          <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1.5 }}>
            {NPC_SECTIONS.map((section) => (
              <Box key={section}>
                <Box
                  component="dt"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                    }}
                  >
                    {t(`npc.section.${section}`)}
                  </Typography>
                  {actions && (
                    <RerollButton
                      tooltip={t(`npc.reroll.${section}`)}
                      onButtonClick={() => actions.onReroll(section)}
                      disabled={!!actions.disabled}
                    />
                  )}
                </Box>
                <Typography
                  component="dd"
                  variant="story"
                  sx={{ m: 0, lineHeight: 1.6 }}
                >
                  {sheet[section]}
                </Typography>
              </Box>
            ))}
          </Box>
          {footer && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 3 }}>
              {footer}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NpcSheet;
