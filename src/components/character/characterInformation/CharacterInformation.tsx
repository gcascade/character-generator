import React, { FC, useContext } from 'react';
import { label } from '../../../content/labels';
import { CharacterContext } from '../../../contexts/CharacterContext';
import useCharacterRequest from '../../../hooks/useCharacterRequest';
import { type MessageKey, useLocale, useT } from '../../../i18n';
import { Character } from '../../../types/character';
import CharacterProperty from '../characterProperty/CharacterProperty';
import { renderCharacter } from '../../../content/character';
import { capitalize } from '../../../content/renderText';
import type { LockableProperty } from '../../../content/template';
import useLocks from '../../../hooks/useLocks';
import { LockReset as UnlockAllIcon } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

type Field = {
  property: LockableProperty;
  label: MessageKey;
};

const FIELDS: Field[] = [
  { property: 'firstName', label: 'field.firstName' },
  { property: 'lastName', label: 'field.lastName' },
  { property: 'epithet', label: 'field.epithet' },
  { property: 'race', label: 'field.race' },
  { property: 'characterClass', label: 'field.class' },
  { property: 'gender', label: 'field.gender' },
  { property: 'age', label: 'field.age' },
  { property: 'alignment', label: 'field.alignment' },
];

const LABEL_KIND = {
  race: 'race',
  characterClass: 'class',
  gender: 'gender',
  alignment: 'alignment',
} as const;

const CharacterInformation: FC = () => {
  const characterContext = useContext(CharacterContext);
  const t = useT();
  const { locale } = useLocale();

  if (!characterContext) {
    throw new Error(
      'CharacterInformation must be used within a CharacterProvider',
    );
  }

  const { requestStatus, rerollCharacterProperty } = useCharacterRequest();
  const { locked, isLocked, toggle, unlockAll } = useLocks();
  const { character } = characterContext;
  const isRerollButtonDisabled = requestStatus === 'loading';

  const display = (property: keyof Character): string | number => {
    const value = character[property];
    if (property in LABEL_KIND) {
      const kind = LABEL_KIND[property as keyof typeof LABEL_KIND];
      return label(kind, String(value), character.gender, locale);
    }
    if (property === 'epithet') {
      return capitalize(renderCharacter(character, locale).epithet);
    }
    return value as string | number;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          columnGap: 2,
          rowGap: 0.25,
        }}
      >
        {FIELDS.map((field) => (
          <CharacterProperty
            key={field.property}
            label={t(field.label)}
            value={display(field.property)}
            tooltip={t(`reroll.${field.property}` as MessageKey)}
            onButtonClick={() => rerollCharacterProperty(field.property)}
            isRerollButtonDisabled={isRerollButtonDisabled}
            locked={isLocked(field.property)}
            onToggleLock={() => toggle(field.property)}
            lockLabel={t(
              `${isLocked(field.property) ? 'unlock' : 'lock'}.${field.property}`,
            )}
          />
        ))}
      </Box>
      {locked.length > 0 && (
        <Button
          size="small"
          startIcon={<UnlockAllIcon />}
          onClick={unlockAll}
          sx={{ mt: 0.5 }}
        >
          {t('lock.unlockAll')}
        </Button>
      )}
    </Box>
  );
};

export default CharacterInformation;
