import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import CharacterGenerator, {
  generateRandomCharacter,
} from "./CharacterGenerator";

describe("CharacterGenerator", () => {
  test("renders CharacterGenerator component without crashing", () => {
    render(<CharacterGenerator />);
  });

  test("generateRandomCharacter function creates a character with correct properties", () => {
    const character = generateRandomCharacter();
    expect(character).toHaveProperty("name");
    expect(character).toHaveProperty("race");
    expect(character).toHaveProperty("characterClass");
    expect(character).toHaveProperty("gender");
    expect(character).toHaveProperty("age");
    expect(character).toHaveProperty("alignment");
    expect(character).toHaveProperty("description");
  });

  test("clicking the generate button updates the character", async () => {
    render(<CharacterGenerator />);
    const button = screen.getByText("New Character");
    const initialCharacter = screen.getByText(/Character\d+/).textContent;
    fireEvent.click(button);
    await waitFor(() => {
      const updatedCharacter = screen.getByText(/Character\d+/).textContent;
      expect(initialCharacter).not.toEqual(updatedCharacter);
    });
  });
});
