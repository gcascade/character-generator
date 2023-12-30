import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Character from "./Character";

describe("Character", () => {
  const mockCharacter = {
    name: "Test Character",
    race: "Elf",
    characterClass: "Warrior",
    gender: "Male",
    age: "100",
    alignment: "Neutral",
    description: "Test description",
  };

  const hasText = (node, text) => node.textContent === text;
  const childrenDontHaveText = (node, text) =>
    // eslint-disable-next-line testing-library/no-node-access
    Array.from(node.children).every((child) => !hasText(child, text));

  test("renders Character component without crashing", () => {
    render(<Character character={mockCharacter} onGenerate={() => {}} />);
  });

  test("displays character properties correctly", () => {
    render(<Character character={mockCharacter} onGenerate={() => {}} />);
    expect(screen.getByText("Test Character")).toBeInTheDocument();

    const properties = [
      "Race: Elf",
      "Class: Warrior",
      "Gender: Male",
      "Age: 100",
      "Alignment: Neutral",
      "Description: Test description",
    ];

    properties.forEach((property) => {
      expect(
        screen.getByText(
          (_, node) =>
            hasText(node, property) && childrenDontHaveText(node, property)
        )
      ).toBeInTheDocument();
    });
  });

  test("calls onGenerate function when button is clicked", () => {
    const mockOnGenerate = jest.fn();
    render(<Character character={mockCharacter} onGenerate={mockOnGenerate} />);
    const button = screen.getByText("New Character");
    fireEvent.click(button);
    expect(mockOnGenerate).toHaveBeenCalled();
  });

  test("applies theme colors correctly to card", () => {
    const theme = createTheme();
    render(
      <ThemeProvider theme={theme}>
        <Character character={mockCharacter} onGenerate={() => {}} />
      </ThemeProvider>
    );

    const card = screen.getByTestId("character-card");
    expect(card).toHaveStyle(
      `background-color: ${theme.palette.background.paper}`
    );
    expect(card).toHaveStyle(`color: ${theme.palette.text.primary}`);
  });

  test("applies hover effects correctly to card", () => {
    render(<Character character={mockCharacter} onGenerate={() => {}} />);
    const card = screen.getByTestId("character-card");
    fireEvent.mouseOver(card);
    expect(card).toHaveStyle("box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2)");
  });
});
