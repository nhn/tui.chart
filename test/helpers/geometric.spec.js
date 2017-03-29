/**
 * @fileoverview Test for geometric.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var geometric = require('../../src/js/helpers/geometric.js');

describe('Test for geometric', function() {
    describe('calculateAdjacent()', function() {
        it('끼인각이 30도이고 빗변이 2일 경우 인접변 너비는 루트3 입니다.', function() {
            var actual = geometric.calculateAdjacent(30, 2),
                expected = Math.sqrt(3);
            expect(actual).toBeCloseTo(expected, 15); // 소수점 16째 자리가 다름
        });
    });

    describe('calculateAdjacent()', function() {
        it('끼인각이 30도이고 빗변이 2일 경우 맞은변 너비는 루트3 입니다.', function() {
            var actual = geometric.calculateOpposite(60, 2),
                expected = Math.sqrt(3);
            expect(actual).toBeCloseTo(expected, 15); // 소수점 16째 자리가 다름
        });
    });
});
