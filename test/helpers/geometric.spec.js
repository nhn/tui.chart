/**
 * @fileoverview Test for geometric.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import geometric from '../../src/js/helpers/geometric.js';

describe('Test for geometric', () => {
  describe('calculateAdjacent()', () => {
    it('should set adjacent side to sqrt(3), when adjacent anlge is 30 degree, and hypotenuse is 2', () => {
      const actual = geometric.calculateAdjacent(30, 2);
      const expected = Math.sqrt(3);
      expect(actual).toBeCloseTo(expected, 15); // 16th decimal place is different
    });
  });

  describe('calculateAdjacent()', () => {
    it('should set opposite side to sqrt(3), when adjacent angle is 30 degree, and hypotenuse is 2.', () => {
      const actual = geometric.calculateOpposite(60, 2);
      const expected = Math.sqrt(3);
      expect(actual).toBeCloseTo(expected, 15); // 16th decimal place is different
    });
  });
});
