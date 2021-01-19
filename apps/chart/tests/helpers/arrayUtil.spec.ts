import { getLongestArrayLength } from '@src/helpers/arrayUtil';

describe('arrayUtil', () => {
  it('getLongestArrayLength', () => {
    const arr = [
      { a: ['a', 'b', 'c'] },
      { a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { a: ['d', 9, 'e', 10] },
    ];

    expect(getLongestArrayLength(arr, 'a')).toBe(10);
  });
});
