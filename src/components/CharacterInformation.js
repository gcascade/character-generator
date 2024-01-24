import React, { useContext } from "react";
import CharacterTypography from "./CharacterTypography";
import { CharacterContext } from "../contexts/CharacterContext";

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
        <strong>Race:</strong> {race}
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
