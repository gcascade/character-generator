import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import CharacterGenerator from "./CharacterGenerator";

describe("CharacterGenerator", () => {
  test("renders CharacterGenerator component without crashing", () => {
    render(<CharacterGenerator />);
  });

  test("renders RPG Character Generator title", () => {
    render(<CharacterGenerator />);
    const title = screen.getByText("RPG Character Generator");
    expect(title).toBeInTheDocument();
  });

  test("renders initial character on load", () => {
    render(<CharacterGenerator />);
    const initialCharacters = screen.getAllByText(/Character\d+/);
    const initialCharacter = initialCharacters[0].textContent;
    expect(initialCharacter).toMatch(/Character\d+/);
  });

  test("clicking the generate button updates the character", async () => {
    render(<CharacterGenerator />);
    const button = screen.getByText("New Character");
    const initialCharacter = screen.getAllByText(/Character\d+/)[0].textContent;
    fireEvent.click(button);
    await waitFor(() => {
      const updatedCharacter =
        screen.getAllByText(/Character\d+/)[0].textContent;
      expect(initialCharacter).not.toEqual(updatedCharacter);
    });
  });
});
