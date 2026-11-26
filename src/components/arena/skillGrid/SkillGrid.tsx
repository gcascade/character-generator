import { Box, LinearProgress, Typography } from '@mui/material';
import React, { FC } from 'react';
import { ARENA_TEXTS } from '../../../content/data';
import { useLocale, useT } from '../../../i18n';
import {
  SKILL_FAMILIES,
  type SkillFamily,
  type Skills,
} from '../../../types/arena';

type SkillGridProps = {
  skills: Skills;
  /** Whose skills: names the group for screen readers. */
  name: string;
  /** Hit points are shown elsewhere. */
  hideHp?: boolean;
};

/** Thirteen skills in four families, and hit points (spec 012 FR-005). */
const SkillGrid: FC<SkillGridProps> = ({ skills, name, hideHp }) => {
  const t = useT();
  const { locale } = useLocale();
  const texts = ARENA_TEXTS[locale];

  return (
    <Box
      role="group"
      aria-label={t('arena.skills', { name })}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        columnGap: 2,
        rowGap: 1,
      }}
    >
      {(Object.keys(SKILL_FAMILIES) as SkillFamily[]).map((family) => (
        <Box key={family}>
          <Typography
            variant="overline"
            component="p"
            sx={{ color: 'text.secondary', lineHeight: 1.6 }}
          >
            {texts.families[family]}
          </Typography>
          {SKILL_FAMILIES[family].map((skill) => (
            <Box
              key={skill}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 2.2rem',
                alignItems: 'center',
                columnGap: 1,
              }}
            >
              <Typography variant="body2" component="span">
                {texts.skills[skill]}
              </Typography>
              <Typography
                variant="body2"
                component="span"
                sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
              >
                {skills.values[skill]}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={skills.values[skill]}
                aria-hidden
                sx={{
                  gridColumn: '1 / -1',
                  height: 4,
                  borderRadius: 2,
                  mb: 0.5,
                }}
              />
            </Box>
          ))}
        </Box>
      ))}
      {!hideHp && (
        <Typography
          variant="body2"
          sx={{ gridColumn: '1 / -1', fontWeight: 600 }}
        >
          {t('arena.hp')} {skills.hp}
        </Typography>
      )}
    </Box>
  );
};

export default SkillGrid;
