import { isInteger } from '@src/helpers/utils';

describe('utils', () => {
  it('isInteger', () => {
    expect(isInteger(0)).toBe(true);
    expect(isInteger(-1)).toBe(true);
    expect(isInteger(1.3)).toBe(false);
  });
});
