import React from "react";
import { render, screen } from "@testing-library/react";
import CharacterInformation from "./CharacterInformation";
import { expectElementWithTextToBeInTheDocument } from "../utils/tests";
import { CharacterContext } from "../contexts/CharacterContext"; // import the context

describe("CharacterInformation", () => {
  const character = {
    firstName: "John",
    lastName: "Doe",
    epithet: "The Brave",
    race: "Elf",
    characterClass: "Warrior",
    gender: "Male",
    age: "100",
    alignment: "Neutral Good",
  };

  test("renders CharacterInformation component without crashing", () => {
    render(
      <CharacterContext.Provider value={{ character }}>
        <CharacterInformation />
      </CharacterContext.Provider>
    );
  });

  test("displays the character information correctly", () => {
    render(
      <CharacterContext.Provider value={{ character }}>
        <CharacterInformation />
      </CharacterContext.Provider>
    );

    expectElementWithTextToBeInTheDocument("First Name: John");
    expectElementWithTextToBeInTheDocument("Last Name: Doe");
    expectElementWithTextToBeInTheDocument("Epithet: The Brave");
    expect(screen.getByText(/Elf/i)).toBeInTheDocument();
    expectElementWithTextToBeInTheDocument("Class: Warrior");
    expectElementWithTextToBeInTheDocument("Gender: Male");
    expectElementWithTextToBeInTheDocument("Age: 100");
    expectElementWithTextToBeInTheDocument("Alignment: Neutral Good");
  });
});
