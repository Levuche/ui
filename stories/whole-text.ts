/**
 * A text matcher for the element that shows `text` whole, when the words sit
 * in more than one element, as a block's editable parts do ("The Old Hall"
 * and "Leeds" in "The Old Hall, Leeds"). The innermost such element.
 *
 *   canvas.getByText(wholeText('The Old Hall, Leeds'))
 */
export const wholeText =
  (text: string) => (_content: string, element: Element | null) =>
    element?.textContent === text &&
    ![...element.children].some((child) => child.textContent === text);
