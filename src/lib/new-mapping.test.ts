export function add(a, b) {
  return a + b;
}

test('adds two numbers correctly', () => {
  expect(add(1, 2)).toBe(3);
});
