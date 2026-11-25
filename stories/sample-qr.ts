/**
 * A stand-in for a QR encoder, for the stories only: it draws the three
 * corner squares and a fixed pattern from the text, so the block has
 * something to show. It doesn't scan. In an app, pass a real encoder.
 */
export function sampleEncode(text: string): boolean[][] {
  const size = 25;
  let seed = [...text].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 16) % 2 === 0;
  };
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, next)
  );
  const finder = (top: number, left: number) => {
    for (let y = -1; y < 8; y++)
      for (let x = -1; x < 8; x++) {
        const row = grid[top + y];
        if (!row || left + x < 0 || left + x >= size) continue;
        const edge = y === 0 || y === 6 || x === 0 || x === 6;
        const core = y >= 2 && y <= 4 && x >= 2 && x <= 4;
        row[left + x] = y >= 0 && y < 7 && x >= 0 && x < 7 && (edge || core);
      }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  return grid;
}
