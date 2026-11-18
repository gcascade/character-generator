import React, { FC, useContext } from 'react';
import { label } from '../../../content/labels';
import { CharacterContext } from '../../../contexts/CharacterContext';
import useCharacterRequest from '../../../hooks/useCharacterRequest';
import { type MessageKey, useLocale, useT } from '../../../i18n';
import { Character } from '../../../types/character';
import CharacterProperty from '../characterProperty/CharacterProperty';

type Field = {
  property: keyof Character;
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
  const { character } = characterContext;
  const isRerollButtonDisabled = requestStatus === 'loading';

  const display = (property: keyof Character): string | number => {
    const value = character[property];
    if (property in LABEL_KIND) {
      const kind = LABEL_KIND[property as keyof typeof LABEL_KIND];
      return label(kind, String(value), character.gender, locale);
    }
    return value as string | number;
  };

  return (
    <>
      {FIELDS.map((field) => (
        <CharacterProperty
          key={field.property}
          label={t(field.label)}
          value={display(field.property)}
          tooltip={t(`reroll.${field.property}` as MessageKey)}
          onButtonClick={() => rerollCharacterProperty(field.property)}
          isRerollButtonDisabled={isRerollButtonDisabled}
        />
      ))}
    </>
  );
};

export default CharacterInformation;
