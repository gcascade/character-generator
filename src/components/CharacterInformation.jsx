import React, { useContext } from "react";
import CharacterTypography from "./CharacterTypography";
import { CharacterContext } from "../contexts/CharacterContext";
import { DwarfIcon, ElfIcon, HumanIcon, OrcIcon } from "./Icons";
import { Races } from "../constants/characterAttributes";

const raceIconMapping = {
  [Races.HUMAN.name]: HumanIcon,
  [Races.ELF.name]: ElfIcon,
  [Races.DWARF.name]: DwarfIcon,
  [Races.ORC.name]: OrcIcon,
  // Add more races here...
};

function getIconByRace(race) {
  const Icon = raceIconMapping[race];
  return Icon ? <Icon style={{ paddingLeft: "5px" }} /> : null;
}

const CharacterInformation = () => {
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
  } = useContext(CharacterContext);

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
        <span style={{ display: "flex", alignItems: "center" }}>
          <strong style={{ marginRight: "5px" }}>Race:</strong>
          <span style={{ marginRight: "5px" }}>{race}</span>
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
