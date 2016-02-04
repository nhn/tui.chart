/**
 * @fileoverview test MapChartColorModel
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartColorModel = require('../../src/js/charts/mapChartColorModel');

describe('test MapChartColorModel', function() {
    var colorModel;

    beforeEach(function() {
        colorModel = new MapChartColorModel('#ffffff', '#ff0000');
    });

    describe('_makeDistance()', function() {
        it('시작 RGB값과 종료 RGB값의 각 속성별 차이값을 계산하여 반환합니다.', function() {
            var startRGB = [255, 255, 255],
                endRGB = [0, 0, 0],
                actual = colorModel._makeDistances(startRGB, endRGB),
                expected = [-255, -255, -255];

            expect(actual).toEqual(expected);
        });
    });

    describe('getColor()', function() {
        it('전달하는 ratio에 맞는 hex color를 계산하여 반환합니다.', function() {
            var actual, expected;

            colorModel.startRGB = [255, 255, 255];
            colorModel.distances = [-100, -150, -200];

            actual = colorModel.getColor(0.5);
            expected = '#cdb49b';

            expect(actual).toBe(expected);
        });

        it('ratio해당하는 color값이 캐싱되어있다면, 캐싱된 값을 반환합니다.', function() {
            var actual, expected;

            colorModel.colorMap = {
                '0.5': '#0000ff'
            };

            actual = colorModel.getColor(0.5);
            expected = '#0000ff';

            expect(actual).toBe(expected);
        });
    });
});
