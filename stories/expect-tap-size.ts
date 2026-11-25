import { expect } from 'storybook/test';

/** Every control a visitor taps must be at least 44px tall (WCAG 2.5.8). */
export async function expectTapSize(element: Element, name = 'control') {
  const { height } = element.getBoundingClientRect();
  await expect(height, `${name} height`).toBeGreaterThanOrEqual(44);
}
