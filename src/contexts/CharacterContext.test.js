import React from "react";
import { render } from "@testing-library/react";
import { CharacterProvider, CharacterContext } from "./CharacterContext";

describe("CharacterContext", () => {
  it("provides character and setCharacter function", () => {
    const TestComponent = () => {
      return (
        <CharacterContext.Consumer>
          {(context) => {
            expect(context.character).toBeDefined();
            expect(typeof context.setCharacter).toBe("function");
            return null;
          }}
        </CharacterContext.Consumer>
      );
    };

    render(
      <CharacterProvider initCharacter="Test Character">
        <TestComponent />
      </CharacterProvider>
    );
  });
});
