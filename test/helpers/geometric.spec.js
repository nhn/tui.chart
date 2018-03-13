/**
 * @fileoverview Test for geometric.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var geometric = require('../../src/js/helpers/geometric.js');

describe('Test for geometric', function() {
    describe('calculateAdjacent()', function() {
        it('should set adjacent side to sqrt(3), when adjacent anlge is 30 degree, and hypotenuse is 2', function() {
            var actual = geometric.calculateAdjacent(30, 2),
                expected = Math.sqrt(3);
            expect(actual).toBeCloseTo(expected, 15); // 16th decimal place is different
        });
    });

    describe('calculateAdjacent()', function() {
        it('should set opposite side to sqrt(3), when adjacent angle is 30 degree, and hypotenuse is 2.', function() {
            var actual = geometric.calculateOpposite(60, 2),
                expected = Math.sqrt(3);
            expect(actual).toBeCloseTo(expected, 15); // 16th decimal place is different
        });
    });
});
