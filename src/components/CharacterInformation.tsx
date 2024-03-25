import React, { CSSProperties, FC, ReactElement, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { CharacterRace } from '../types/character';
import CharacterTypography from './CharacterTypography';
import { DwarfIcon, ElfIcon, HumanIcon, OrcIcon } from './Icons';

const raceIcon: Record<CharacterRace, FC<IconProps>> = {
  Human: HumanIcon,
  Elf: ElfIcon,
  Dwarf: DwarfIcon,
  Orc: OrcIcon,
};

type IconProps = {
  style?: CSSProperties;
};

function getIconByRace(race: CharacterRace): ReactElement | null {
  const Icon = raceIcon[race] as FC<IconProps> | undefined;
  return Icon ? <Icon style={{ paddingLeft: '5px' }} /> : null;
}

const CharacterInformation: FC = () => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error(
      'CharacterInformation must be used within a CharacterProvider',
    );
  }

  const {
    character: {
      firstName,
      lastName,
      epithet,
      race,
      characterClass,
      gender,
      age,
      alignment,
    },
  } = context;

  return (
    <>
      <CharacterTypography>
        <strong>First Name:</strong> {firstName}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Last Name:</strong> {lastName}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Epithet:</strong> {epithet}
      </CharacterTypography>
      <CharacterTypography>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <strong style={{ marginRight: '5px' }}>Race:</strong>
          <span style={{ marginRight: '5px' }}>{race}</span>
          {getIconByRace(race)}
        </span>
      </CharacterTypography>
      <CharacterTypography>
        <strong>Class:</strong> {characterClass}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Gender:</strong> {gender}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Age:</strong> {age}
      </CharacterTypography>
      <CharacterTypography>
        <strong>Alignment:</strong> {alignment}
      </CharacterTypography>
    </>
  );
};

export default CharacterInformation;
