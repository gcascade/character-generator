import React from 'react';

const Character = ({ character }) => {
  return (
    <div>
      <h2>{character.name}</h2>
      <p><strong>Race:</strong> {character.race}</p>
      <p><strong>Class:</strong> {character.characterClass}</p>
      <p><strong>Description:</strong> {character.description}</p>
    </div>
  );
};

export default Character;