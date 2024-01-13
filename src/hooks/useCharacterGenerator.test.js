import { getDefaultBackground } from "./useCharacterGenerator";
import {
  Genders,
  Races,
  Classes,
  Alignments,
} from "../constants/characterAttributes";

describe("getDefaultBackground", () => {
  const genders = [Genders.MALE, Genders.FEMALE, Genders.NON_BINARY];

  test.each(genders)("returns a default background for gender %s", (gender) => {
    const defaultBackground = getDefaultBackground(gender);
    expect(defaultBackground).toBeDefined();
    expect(defaultBackground.gender).toBe(gender);
    expect(defaultBackground.race).toBe(Races.DEFAULT.name);
    expect(defaultBackground.characterClass).toBe(Classes.DEFAULT);
    expect(defaultBackground.alignment).toBe(Alignments.DEFAULT);
  });
});
