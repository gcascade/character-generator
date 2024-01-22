import React from "react";
import { render, act, screen } from "@testing-library/react";
import CharacterImage from "./CharacterImage";

jest.mock("../utils/image", () => {
  const {
    Races,
    Classes,
    Genders,
  } = require("../constants/characterAttributes");

  return {
    __esModule: true,
    isImage: (url) => {
      const raceExists = Object.values(Races).some((race) =>
        url.toLowerCase().includes(race.name.toLowerCase())
      );
      const classExists = Object.values(Classes).some((cls) =>
        url.toLowerCase().includes(cls.toLowerCase())
      );
      const genderExists = Object.values(Genders).some((gender) =>
        url.toLowerCase().includes(gender.toLowerCase())
      );

      return Promise.resolve(raceExists && classExists && genderExists);
    },
  };
});

describe("CharacterImage", () => {
  test("renders CharacterImage component without crashing", async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterImage
          character={{ gender: "Male", race: "Elf", characterClass: "Warrior" }}
        />
      );
    });
  });

  test("renders the correct image based on the character's properties", async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterImage
          character={{ gender: "Male", race: "Elf", characterClass: "Warrior" }}
        />
      );
    });
    const image = await screen.findByAltText("Elf Warrior");
    expect(image.src).toContain("/images/elf/warrior/male1.png");
  });

  test("renders the default image when the character's image does not exist", async () => {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <CharacterImage
          character={{
            gender: "Male",
            race: "NonexistentRace",
            characterClass: "NonexistentClass",
          }}
        />
      );
    });
    const image = await screen.findByAltText(
      "NonexistentRace NonexistentClass"
    );
    expect(image.src).toContain("/images/default-portrait.png");
  });
});
