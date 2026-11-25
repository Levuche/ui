import { expect } from 'storybook/test';

/**
 * Every control a visitor taps is at least control tall: 44 px on a touch
 * screen and 40 px with a mouse (WCAG 2.5.8 asks for at least 24 px).
 */
export async function expectTapSize(element: Element, name = 'control') {
  const { height } = element.getBoundingClientRect();
  const min = matchMedia('(pointer: coarse)').matches ? 44 : 40;
  await expect(height, `${name} height`).toBeGreaterThanOrEqual(min);
}
