const sum = require('./sum')

test('Add 2 numbers', () => {
  expect(sum(1, 2)).toBe(3)
})