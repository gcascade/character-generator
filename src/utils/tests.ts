import { screen } from '@testing-library/react';

export function hasText(node: Element, text: string): boolean {
  return node.textContent === text;
}

export function childrenDontHaveText(node: Element, text: string): boolean {
  return Array.from(node.children).every((child) => child.textContent !== text);
}

export function expectElementWithTextToBeInTheDocument(property: string): void {
  expect(
    screen.getByText(
      (_, node) =>
        node !== null &&
        hasText(node, property) &&
        childrenDontHaveText(node, property),
    ),
  ).toBeInTheDocument();
}
