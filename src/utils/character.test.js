import { generateRandomCharacter } from "./character";

describe("generateRandomCharacter", () => {
  let character;

  beforeEach(() => {
    character = generateRandomCharacter();
  });

  test("returns an object", () => {
    expect(typeof character).toBe("object");
  });

  test("has the correct properties", () => {
    expect(character).toHaveProperty("firstName");
    expect(character).toHaveProperty("lastName");
    expect(character).toHaveProperty("race");
    expect(character).toHaveProperty("characterClass");
    expect(character).toHaveProperty("gender");
    expect(character).toHaveProperty("epithet");
    expect(character).toHaveProperty("age");
    expect(character).toHaveProperty("alignment");
    expect(character).toHaveProperty("background");
  });

  test("firstName is a string", () => {
    expect(typeof character.firstName).toBe("string");
  });

  test("lastName is a string", () => {
    expect(typeof character.lastName).toBe("string");
  });

  test("race is a string", () => {
    expect(typeof character.race).toBe("string");
  });

  test("characterClass is a string", () => {
    expect(typeof character.characterClass).toBe("string");
  });

  test("gender is a string", () => {
    expect(typeof character.gender).toBe("string");
  });

  test("epithet is a string", () => {
    expect(typeof character.epithet).toBe("string");
  });

  test("age is a number", () => {
    expect(typeof character.age).toBe("number");
  });

  test("alignment is a string", () => {
    expect(typeof character.alignment).toBe("string");
  });

  test("background is an object", () => {
    expect(typeof character.background).toBe("object");
  });
});
