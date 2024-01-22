import { screen } from "@testing-library/react";

export function hasText(node, text) {
  return node.textContent === text;
}

export function childrenDontHaveText(node, text) {
  return Array.from(node.children).every((child) => child.textContent !== text);
}

export function expectElementWithTextToBeInTheDocument(property) {
  expect(
    screen.getByText(
      (_, node) =>
        hasText(node, property) && childrenDontHaveText(node, property)
    )
  ).toBeInTheDocument();
}
