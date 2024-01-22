import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ThemeProvider } from "@emotion/react";
import CharacterBackground from "./CharacterBackground";
import theme from "../themes/themes";

describe("CharacterBackground", () => {
  const background = {
    title: "Test Title",
    content: [
      "Test content 1",
      "Test content 2",
      "Test content 3",
      "Test content 4",
      "Test content 5",
    ],
  };

  test("renders CharacterBackground component without crashing", () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterBackground background={background} />
      </ThemeProvider>
    );
  });

  test("displays the title correctly", () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterBackground background={background} />
      </ThemeProvider>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  test("displays the content correctly", () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterBackground background={background} />
      </ThemeProvider>
    );
    expect(screen.getByText("Test content 1")).toBeInTheDocument();
  });

  test("expands and collapses the content when the button is clicked", () => {
    render(
      <ThemeProvider theme={theme}>
        <CharacterBackground background={background} />
      </ThemeProvider>
    );

    // Initially, the button should say "Show More..."
    const button = screen.getByText("Show More...");
    expect(button).toBeInTheDocument();

    // After clicking the button, it should say "Show Less"
    fireEvent.click(button);
    expect(button.textContent).toBe("Show Less");

    // After clicking the button again, it should say "Show More..."
    fireEvent.click(button);
    expect(button.textContent).toBe("Show More...");
  });
});
