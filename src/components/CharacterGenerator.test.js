import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import CharacterGenerator from "./CharacterGenerator";
import { CharacterContext } from "../contexts/CharacterContext";

describe("CharacterGenerator", () => {
  const character = {
    firstName: "John",
    lastName: "Doe",
    epithet: "The Brave",
    race: "Elf",
    characterClass: "Warrior",
    gender: "Male",
    age: "100",
    alignment: "Neutral Good",
    background: {
      title: "Test Title",
      content: [
        "Test content 1",
        "Test content 2",
        "Test content 3",
        "Test content 4",
        "Test content 5",
      ],
    },
  };

  const setCharacter = jest.fn();

  test("renders CharacterGenerator component without crashing", () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <CharacterGenerator />
      </CharacterContext.Provider>
    );
  });

  test("renders RPG Character Generator title", () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <CharacterGenerator />
      </CharacterContext.Provider>
    );
    const title = screen.getByText("RPG Character Generator");
    expect(title).toBeInTheDocument();
  });

  test("renders initial character on load", () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <CharacterGenerator />
      </CharacterContext.Provider>
    );
    const initialCharacters = screen.getAllByText(/\w+/);
    const initialCharacter = initialCharacters[0].textContent;
    expect(initialCharacter).toMatch(/\w+/);
  });

  test("clicking the generate button updates the character", async () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <CharacterGenerator />
      </CharacterContext.Provider>
    );
    const button = screen.getByText("New Character");
    fireEvent.click(button);
    await waitFor(() => {
      expect(setCharacter).toHaveBeenCalled();
    });
  });
});
