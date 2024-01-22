import React from "react";
import CharacterTypography from "./CharacterTypography";

const CharacterInformation = ({ character }) => {
  const {
    firstName,
    lastName,
    epithet,
    race,
    characterClass,
    gender,
    age,
    alignment,
  } = character;

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
